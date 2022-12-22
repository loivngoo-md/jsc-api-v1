import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_TYPE, POSITION_STATUS, SESSION_STATUS } from 'src/common/enums';
import { dateFormatter } from 'src/helpers/moment';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { StockStorageService } from '../stock-storage/stock-storage.service';
import { StockService } from '../stock/stock.service';
import { TradingSessionService } from '../trading-session/trading-session.service';
import { ClosePositionDto, CreateOrderDto } from './dto/create-order.dto';
import { OrderQuery } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly _orderRepo: Repository<Order>,
    private readonly _stockService: StockService,
    private readonly _appUserService: AppUserService,
    private readonly _tradingSessionService: TradingSessionService,
    private readonly _stockStorageService: StockStorageService,
  ) {}

  async list_orders_by_user(user_id: number) {
    const $orders = await this._orderRepo.find({ where: { user_id } });
    if (!!$orders) {
      return $orders;
    }
    throw new NotFoundException();
  }

  async listAllOrders(query: OrderQuery, user_id?: number) {
    const page = +query['page'] || 1;
    const limit = +query['limit'] || 10;

    const end_time = query['end_time']
      ? new Date(query['end_time'])
      : new Date();
    const start_time = query['start_time']
      ? new Date(query['start_time'])
      : null;

    if (user_id) {
      query['user_id'] = user_id;
      delete query['username'];
    }

    query['created_at'] = start_time
      ? Between(start_time, end_time)
      : LessThanOrEqual(end_time);

    const rec = await this._orderRepo
      .createQueryBuilder('o')
      .innerJoinAndSelect('app_users', 'u', 'o.user_id = u.id')
      .select([
        'o.*',
        'u.account_name as realname',
        'u.agent_code as agent',
        'u.superior as superior',
        'o.created_at as created_at',
        'o.updated_at as updated_at',
      ])
      .where(query)
      .take(limit)
      .skip((page - 1) * limit)
      .getRawMany();

    return {
      count: rec.length,
      data: rec,
    };
  }

  async listAllToday(query: OrderQuery, user_id?: number) {
  
  }

  async viewDetailOrder(id: number, user_id?: number) {
    const whereConditions = { id };
    user_id && Object.assign(whereConditions, { user_id });
    const $orders = await this._orderRepo.findOne({ where: whereConditions });
    if (!!$orders) {
      return $orders;
    }
    throw new NotFoundException();
  }

  async buy(dto: any) {
    const { stock_code, quantity, user_id } = dto;
    const [stock, user, session] = await Promise.all([
      this._stockService.findOne(stock_code),
      this._appUserService.findOne(+user_id),
      this._tradingSessionService.findOpeningSession(),
    ]);
    if (!session) {
      throw new HttpException(
        'Not found opening session',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { detail } = session;
    const { transactions_rate } = detail['transactions_rate'] as any;
    const { P, M, N, ZT, DT } = stock;

    const amount = quantity * P;
    const actual_amount = amount * (1 + transactions_rate / 100);

    if (+user['balance_avail'] < actual_amount) {
      throw new HttpException(
        'Balance Available is not enough',
        HttpStatus.BAD_REQUEST,
      );
    }

    const data = this._orderRepo.create({
      type: ORDER_TYPE.BUY,
      stock_code: stock_code,
      quantity: quantity,
      price: P,
      fee_rate: transactions_rate['transaction_fee'],
      amount: amount,
      actual_amount: actual_amount,
      user_id: user_id,
      stock_market: M,
      stock_name: N,
      zhangting: ZT,
      dieting: DT,
      trading_session: session['id'],
    });
    // TODO: store in transaction
    await Promise.all([
      this._orderRepo.save(data),
      this._stockStorageService.store({
        stock_code: stock_code,
        amount: amount,
        user_id: user_id,
        quantity: quantity,
        price: P,
        trading_session: session['id'],
      }),
      this._appUserService.update(user_id, {
        balance_avail: +user['balance_avail'] - +actual_amount,
        balance: +user['balance'] - +actual_amount,
      }),
    ]);
    return data;
  }

  async sell(position_id: string, user_id?: number) {
    const [position, currentSession] = await Promise.all([
      this._stockStorageService.findOne(+position_id),
      this._tradingSessionService.findOpeningSession(),
    ]);

    if (!position) {
      throw new NotFoundException();
    }
    if (position.status === POSITION_STATUS.CLOSED) {
      throw new HttpException('Position is closed.', HttpStatus.BAD_REQUEST);
    }

    if (!currentSession) {
      throw new HttpException(
        'Not found opening session.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (currentSession['id'] === position['trading_session']) {
      throw new HttpException(
        'Cannot sell in the same trading session.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user_id && +user_id !== +position.user_id) {
      throw new UnauthorizedException();
    }

    const [stock, user] = await Promise.all([
      this._stockService.findOne(position['stock_code']),
      this._appUserService.findOne(position.user_id),
    ]);

    if (!stock) {
      throw new NotFoundException();
    }

    const { quantity } = position;
    const { detail } = currentSession;
    const { transactions_rate } = detail['transactions_rate'] as any;
    const { P, M, N, ZT, DT } = stock;

    const amount = P * quantity;
    const actual_amount = amount * (1 - transactions_rate['transaction_fee']);

    const created_order = this._orderRepo.create({
      type: ORDER_TYPE.SELL,
      stock_code: position['stock_code'],
      quantity: quantity,
      price: P,
      fee_rate: transactions_rate['transaction_fee'],
      amount: amount,
      actual_amount: actual_amount,
      user_id: position['user_id'],
      stock_market: M,
      stock_name: N,
      zhangting: ZT,
      dieting: DT,
      trading_session: currentSession['id'],
    });
    await Promise.all([
      this._appUserService.update(user_id, {
        balance: +user['balance'] + +amount,
        balance_avail: +user['balance_avail'] + +amount,
      }),
      this._stockStorageService.update(position_id, {
        status: POSITION_STATUS.CLOSED,
      }),
      this._orderRepo.save(created_order),
    ]);

    return created_order;
  }

  findAll() {
    return this._orderRepo.find();
  }

  findOne(id: number) {
    return this._orderRepo.findOne({ where: { id } });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}

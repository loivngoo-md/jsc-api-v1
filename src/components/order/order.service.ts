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
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { StockStorageService } from '../stock-storage/stock-storage.service';
import { StockService } from '../stock/stock.service';
import { TradingSessionService } from '../trading-session/trading-session.service';
import { ClosePositionDto, CreateOrderDto } from './dto/create-order.dto';
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

  async list_all_orders() {
    return this._orderRepo.find();
  }

  async view_detail_order(id: number) {
    const $orders = await this._orderRepo.findOne({ where: { id } });
    if (!!$orders) {
      return $orders;
    }
    throw new NotFoundException();
  }

  async list_orders_today_for_user(user_id: number) {
    const today = new Date();
    let $list_orders = await this._orderRepo.find({
      where: {
        user_id,
        // created_at: LessThanOrEqual(today)
      },
    });

    if (!!$list_orders) {
      return $list_orders;
    }
    throw new NotFoundException();
  }

  async create(dto: CreateOrderDto) {
    const data = await this._orderRepo.create(dto);
    await this._orderRepo.save(data);
    return data;
  }

  async sellOnApp(position_id: string, user_id: number) {
    const position = await this._stockStorageService.findOne(+position_id);
    const session = await this._tradingSessionService.findOne(
      position.trading_session,
    );

    if (!position) {
      throw new NotFoundException();
    }

    if (!session) {
      throw new NotFoundException();
    }
    if (session && session['status'] !== SESSION_STATUS.CLOSED) {
      throw new Error('Seesion not closed');
    }

    if (
      +user_id !== +position.user_id ||
      position.status === POSITION_STATUS.CLOSED
    ) {
      throw new UnauthorizedException();
    }

    const stock = await this._stockService.findOne(position.stock_code);
    if (!stock) {
      throw new NotFoundException();
    }

    const amount = stock.P * +position.quantity;

    let { balance, balance_avail } = await this._appUserService.findOne(
      user_id,
    );
    balance_avail += amount;
    balance += amount;

    await this._appUserService.update(user_id, { balance, balance_avail });
    await this._stockStorageService.update(position_id, {
      status: POSITION_STATUS.CLOSED,
    });

    const created_order = this._orderRepo.create({
      amount,
      type: ORDER_TYPE.SELL,
      zhangting: stock.ZT,
      dieting: stock.DT,
      quantity: position.quantity,
      stock_code: stock.FS,
      stock_market: stock.M,
      stock_name: stock.N,
      user_id,
    });
    await this._orderRepo.save(created_order);
    return created_order;
  }

  async sellOnCms(position_id: string) {
    // const stock = await this._stockService.findOne(dto['stock_code']);
    const position = await this._stockStorageService.findOne(+position_id);
    const session = await this._tradingSessionService.findOne(
      position['trading_session'],
    );

    if (!position) {
      throw new NotFoundException();
    }
    if (position.status !== POSITION_STATUS.CLOSED) {
      throw new NotFoundException();
    }

    if (!session) {
      throw new NotFoundException();
    }
    if (session && session.status !== SESSION_STATUS.CLOSED) {
      throw new Error('Seesion not closed');
    }

    const stock = await this._stockService.findOne(position.stock_code);
    if (!stock) {
      throw new NotFoundException();
    }

    const amount = stock.P * +position.quantity;

    let { balance, balance_avail } = await this._appUserService.findOne(
      position.user_id,
    );
    balance_avail += amount;
    balance += amount;

    await this._appUserService.update(position.user_id, {
      balance,
      balance_avail,
    });
    await this._stockStorageService.update(position_id, {
      status: POSITION_STATUS.CLOSED,
    });

    const created_order = this._orderRepo.create({
      amount,
      type: ORDER_TYPE.SELL,
      zhangting: stock.ZT,
      dieting: stock.DT,
      quantity: position.quantity,
      stock_code: stock.FS,
      stock_market: stock.M,
      stock_name: stock.N,
      user_id: position.user_id,
    });
    await this._orderRepo.save(created_order);
    return created_order;
  }

  async buyOnCms(dto) {
    const stock = await this._stockService.findOne(dto['stock_code']);
    const session = await this._tradingSessionService.findOne(
      dto['trading_session'],
    );

    if (!stock['FS']) {
      throw new NotFoundException();
    }

    if (!session) {
      throw new NotFoundException();
    }
    if (session && session['status'] !== SESSION_STATUS.OPENING) {
      throw new Error('Seesion not opening');
    }

    dto['amount'] = stock['P'] * dto['quantity'];

    const { balance } = await this._appUserService.findOne(dto['user_id']);

    if (balance < dto['amount']) {
      throw new HttpException('Not enough money', HttpStatus.BAD_REQUEST);
    }

    await this._appUserService.update(dto['user_id'], {
      balance: balance - dto['amount'],
    });
    await this._stockStorageService.store(dto);

    const created_order = this._orderRepo.create(dto);
    await this._orderRepo.save(created_order);
    return created_order;
  }

  async buyOnApp(dto) {
    const stock = await this._stockService.findOne(dto['stock_code']);
    const session = await this._tradingSessionService.findOne(
      dto['trading_session'],
    );

    if (!stock['FS']) {
      throw new NotFoundException();
    }

    if (!session) {
      throw new NotFoundException();
    }
    if (session && session['status'] !== SESSION_STATUS.OPENING) {
      throw new Error('Seesion not opening');
    }

    dto['amount'] = stock['P'] * dto['quantity'];

    let { balance, balance_avail } = await this._appUserService.findOne(
      dto['user_id'],
    );
    if (balance < dto['amount']) {
      throw new HttpException('Not enough money', HttpStatus.BAD_REQUEST);
    }
    balance = balance - dto['amount'];
    balance_avail = balance_avail - dto['amount'];

    await this._appUserService.update(dto['user_id'], {
      balance,
      balance_avail,
    });

    await this._stockStorageService.store(dto);

    const response = this._orderRepo.create(dto);
    await this._orderRepo.save(response);
    return response;
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

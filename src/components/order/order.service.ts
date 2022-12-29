import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ORDER_TYPE,
  POSITION_STATUS,
  TRANSACTION_TYPE,
} from 'src/common/enums';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { StockStorageService } from '../stock-storage/stock-storage.service';
import { StockService } from '../stock/stock.service';
import { TradingSessionService } from '../trading-session/trading-session.service';
import { TransactionsService } from '../transactions/transactions.service';
import { OrderQuery, OrderTodayQuery } from './dto/query-order.dto';
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
    private readonly _trxService: TransactionsService,
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
    const pageSize = +query['pageSize'] || 10;

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
        'u.real_name as real_name',
        'u.agent_code as agent',
        'u.superior as superior',
        'o.created_at as created_at',
        'o.updated_at as updated_at',
      ])
      .where({})
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .getRawMany();

    return {
      count: rec.length,
      data: rec,
    };
  }

  async listAllToday(query: OrderTodayQuery, user_id?: number) {
    const page = +query['page'] || 1;
    const pageSize = +query['pageSize'] || 10;

    user_id && (query['user_id'] = user_id);

    const rec = await this._orderRepo
      .createQueryBuilder('o')
      .innerJoinAndSelect('app_users', 'u', 'o.user_id = u.id')
      .select([
        'o.*',
        'u.real_name as real_name',
        'u.agent_code as agent',
        'u.superior as superior',
        'o.created_at as created_at',
        'o.updated_at as updated_at',
      ])
      .where(query)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .getRawMany();

    return {
      count: rec.length,
      data: rec,
    };
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
    const { transaction_fees } = detail['transactions_rate'] as any;
    const { P, M, N, ZT, DT } = stock;

    const amount = quantity * P;
    const actual_amount = amount * (1 + transaction_fees / 100);

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
      fee_rate: transaction_fees,
      amount: amount,
      actual_amount: actual_amount,
      user_id: user_id,
      username: user['username'],
      stock_market: M,
      stock_name: N,
      zhangting: ZT,
      dieting: DT,
      trading_session: session['id'],
    });

    const trxInfo = {
      trx_id: data['id'],
      type: TRANSACTION_TYPE.BUY,
      user_id: data['user_id'],
      before: user['balance'],
      after: user['balance'] - data['actual_amount'],
    };
    // TODO: store in transaction
    await Promise.all([
      this._orderRepo.save(data),
      this._trxService.addTrx(trxInfo),
      this._stockStorageService.store({
        stock_code: stock_code,
        amount: amount,
        user_id: user_id,
        quantity: quantity,
        price: P,
        trading_session: session['id'],
      }),
      this._appUserService.updateBalance(user_id, {
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
    const { transaction_fees } = detail['transactions_rate'] as any;
    const { P, M, N, ZT, DT } = stock;

    const amount = P * quantity;
    const actual_amount = amount * (1 - transaction_fees);

    const created_order = this._orderRepo.create({
      type: ORDER_TYPE.SELL,
      stock_code: position['stock_code'],
      quantity: quantity,
      price: P,
      username: user['username'],
      fee_rate: transaction_fees,
      amount: amount,
      actual_amount: actual_amount,
      user_id: position['user_id'],
      stock_market: M,
      stock_name: N,
      zhangting: ZT,
      dieting: DT,
      trading_session: currentSession['id'],
    });

    const trxInfo = {
      trx_id: created_order['id'],
      type: TRANSACTION_TYPE.SELL,
      user_id: created_order['user_id'],
      before: user['balance'],
      after: +user['balance'] + +created_order['actual_amount'],
    };
    await Promise.all([
      this._appUserService.updateBalance(user_id, {
        balance: +user['balance'] + +amount,
        balance_avail: +user['balance_avail'] + +amount,
      }),
      this._trxService.addTrx(trxInfo),
      this._stockStorageService.update(position_id, {
        status: POSITION_STATUS.CLOSED,
      }),
      this._orderRepo.save(created_order),
    ]);

    return created_order;
  }

  async bulkSell(position_ids: number[], stock_code: string, user_id: number) {
    const [positions, currentSession] = await Promise.all([
      this._stockStorageService.findBulkSell(position_ids, stock_code, user_id),
      this._tradingSessionService.findOpeningSession(),
    ]);

    if (!currentSession) {
      throw new HttpException(
        'Not found opening session.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const [stock, user] = await Promise.all([
      this._stockService.findOne(stock_code),
      this._appUserService.findOne(user_id),
    ]);

    const { detail } = currentSession;
    const { transaction_fees } = detail['transactions_rate'] as any;
    const { P, M, N, ZT, DT } = stock;

    const orderInfos = [];
    const trxInfos = [];
    let updateAmount = 0;
    for (const position of positions) {
      const { quantity } = position;

      const amount = P * quantity;
      const actual_amount = amount * (1 - transaction_fees);

      const created_order = this._orderRepo.create({
        type: ORDER_TYPE.SELL,
        stock_code: stock_code,
        quantity: quantity,
        price: P,
        username: user['username'],
        fee_rate: transaction_fees,
        amount: amount,
        actual_amount: actual_amount,
        user_id: user_id,
        stock_market: M,
        stock_name: N,
        zhangting: ZT,
        dieting: DT,
        trading_session: currentSession['id'],
      });
      const trxInfo = {
        trx_id: created_order['id'],
        type: TRANSACTION_TYPE.SELL,
        user_id: created_order['user_id'],
        before: user['balance'],
        after: +user['balance'] + +created_order['actual_amount'],
      };
      orderInfos.push(created_order);
      trxInfos.push(trxInfo);
      updateAmount += actual_amount;
    }

    await Promise.all([
      this._appUserService.updateBalance(user_id, {
        balance: +user['balance'] + +updateAmount,
        balance_avail: +user['balance_avail'] + +updateAmount,
      }),
      this._trxService.addTrx(trxInfos),
      this._stockStorageService.closePositions(position_ids),
      this._orderRepo.save(orderInfos),
    ]);

    return orderInfos;
  }
}

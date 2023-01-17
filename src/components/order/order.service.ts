import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  COMMON_STATUS,
  ORDER_TYPE,
  POSITION_STATUS,
  TRANSACTION_TYPE,
  TRX_TYPE,
} from 'src/common/enums';
import { Repository } from 'typeorm';
import { MESSAGES } from '../../common/constant';
import { PaginationQuery } from '../../helpers/dto-helper';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { BlockTransactionsService } from '../block-transactions/block-transactions.service';
import { StockStorageService } from '../stock-storage/stock-storage.service';
import { StockService } from '../stock/stock.service';
import { TradingSessionService } from '../trading-session/trading-session.service';
import { TransactionsService } from '../transactions/transactions.service';
import { OrderQuery } from './dto/query-order.dto';
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
    private readonly _blockTrxService: BlockTransactionsService,
  ) {}

  async list_orders_by_user(user_id: number) {
    return await this._orderRepo.find({
      where: { user_id },
      order: { created_at: 'DESC' },
    });
  }

  async listAllOrders(
    query: OrderQuery,
    user_id?: number,
    agent_path?: string,
  ) {
    const {
      page,
      pageSize,
      real_name,
      superior,
      type,
      username,
      stock_code,
      start_time,
      end_time,
    } = query;

    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    const queryBuilder = this._orderRepo
      .createQueryBuilder('o')
      .innerJoinAndSelect('app_users', 'u', 'o.user_id = u.id')
      .innerJoinAndSelect('agent', 'ag', 'u.agent = ag.id')
      .select([
        'o.*',
        'u.real_name as real_name',
        'u.agent as agent',
        'u.superior as superior',
        'o.created_at as created_at',
        'o.updated_at as updated_at',
        'row_to_json(ag.*) as agent_detail',
      ])
      .where({});

    !user_id &&
      username &&
      queryBuilder.andWhere(`u.username ILIKE '%${username}%'`);
    user_id && queryBuilder.andWhere(`u.id = user_id`);
    agent_path && queryBuilder.andWhere(`ag.path LIKE '%${agent_path}%'`);
    superior && queryBuilder.andWhere(`u.superior ILIKE '%${superior}%'`);
    real_name && queryBuilder.andWhere(`u.real_name ILIKE '%${real_name}%'`);
    stock_code && queryBuilder.andWhere(`o.stock_code ILIKE '%${stock_code}%'`);
    typeof type !== 'undefined' && queryBuilder.andWhere(`o.type = ${type}`);
    start_time && queryBuilder.andWhere(`o.created_at < ${start_time}`);
    end_time && queryBuilder.andWhere(`o.created_at > ${end_time}`);

    const total = await queryBuilder.clone().getCount();
    const recs = await queryBuilder
      .limit(take)
      .offset(skip)
      .orderBy('o.created_at', 'DESC')
      .getRawMany();

    return {
      count: recs.length,
      data: recs,
      total,
    };
  }

  async listAllToday(query: PaginationQuery, user_id?: number) {
    const page = +query.page || 1;
    const pageSize = +query.pageSize || 10;

    const queryBuilder = this._orderRepo
      .createQueryBuilder('o')
      .innerJoinAndSelect('app_users', 'u', 'o.user_id = u.id')
      .innerJoinAndSelect('agent', 'ag', 'u.agent = ag.id')
      .select([
        'o.*',
        'u.real_name as real_name',
        'u.agent_code as agent',
        'u.superior as superior',
        'o.created_at as created_at',
        'o.updated_at as updated_at',
        'row_to_json(ag.*) as agent_detail',
      ])
      .where({});

    user_id && queryBuilder.andWhere(`u.user_id = ${user_id}`);

    const total = await queryBuilder.clone().getCount();
    const recs = await queryBuilder
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .orderBy('o.created_at', 'DESC')
      .getRawMany();

    return {
      count: recs.length,
      data: recs,
      total,
    };
  }

  async viewDetailOrder(id: number, user_id?: number) {
    const whereConditions = { id };
    user_id && Object.assign(whereConditions, { user_id });
    const $orders = await this._orderRepo.findOne({ where: whereConditions });
    if (!!$orders) {
      return $orders;
    }
    throw new NotFoundException(MESSAGES.ORDER_NOT_FOUND);
  }

  async buy(body: any, isLarTrx?: boolean) {
    const { stock_code, trx_key, quantity, user_id } = body;
    const [stock, user, session, blockTrx] = await Promise.all([
      isLarTrx
        ? this._stockService.findByC(stock_code)
        : this._stockService.findOne(stock_code),
      this._appUserService.findOne(+user_id),
      this._tradingSessionService.findOpeningSession(isLarTrx),
      isLarTrx && this._blockTrxService.findByCodeAndKey(stock_code, trx_key),
    ]);

    if (isLarTrx && blockTrx.status !== COMMON_STATUS.OPENING) {
      throw new BadRequestException(MESSAGES.BLOCK_TRX_NOT_OPEN);
    }
    if (isLarTrx && blockTrx.quantity > quantity) {
      throw new BadRequestException(
        // `${MESSAGE.MINIMUM_QUANTITY_IS} ${blockTrx.quantity}.`, // ERROR MESSAGE
      );
    }

    const { detail } = session;
    const { transaction_fees } = detail.transactions_rate as any;
    const discount = isLarTrx ? blockTrx.discount : 0;
    const P = stock.P * (1 - discount / 100);

    const amount = stock.P * quantity;
    const actual_amount =
      amount * (1 + transaction_fees / 100 - discount / 100);

    if (+user.balance_avail < actual_amount) {
      throw new BadRequestException(MESSAGES.APP_NOT_ENOUGH_MONEY);
    }

    const orderInfo = this._orderRepo.create({
      type: ORDER_TYPE.BUY,
      stock_code: stock.FS,
      quantity,
      price: P,
      fee_rate: transaction_fees,
      amount,
      actual_amount,
      discount,
      user_id,
      username: user.username,
      stock_market: stock.M,
      stock_name: stock.N,
      zhangting: stock.ZT,
      dieting: stock.DT,
      trading_session: session.id,
      trx_type: isLarTrx ? TRX_TYPE.LAR : TRX_TYPE.NOR,
    });

    const [newOrder, _, __] = await Promise.all([
      this._orderRepo.save(orderInfo),
      this._stockStorageService.store({
        stock_code: stock.FS,
        amount: actual_amount,
        user_id,
        quantity,
        price: P,
        trading_session: session.id,
        type: isLarTrx ? TRX_TYPE.LAR : TRX_TYPE.NOR,
      }),
      this._appUserService.updateBalance(user_id, {
        balance_avail: +user.balance_avail - +actual_amount,
        balance: +user.balance - +actual_amount,
      }),
    ]);

    const trxInfo = {
      trx_id: newOrder.id,
      type: TRANSACTION_TYPE.BUY,
      user_id,
      before: user.balance,
      after: user.balance - actual_amount,
    };

    await this._trxService.addTrx(trxInfo);
    return orderInfo;
  }

  async sell(position_id: string, user_id?: number) {
    const [position, currentSession] = await Promise.all([
      this._stockStorageService.findOne(+position_id),
      this._tradingSessionService.findOpeningSession(),
    ]);

    if (!position) {
      throw new NotFoundException(MESSAGES.POSITION_NOT_FOUND);
    }
    if (position.status === POSITION_STATUS.CLOSED) {
      throw new BadRequestException(MESSAGES.POSITION_NOT_CLOSED);
    }

    if (!currentSession) {
      throw new NotFoundException(MESSAGES.TRADING_SESSION_NOT_OPEN);
    }

    if (currentSession.id === position.trading_session) {
      throw new BadRequestException(MESSAGES.POSITION_CANT_SELL);
    }

    if (user_id && +user_id !== +position.user_id) {
      throw new UnauthorizedException(MESSAGES.UNAUTHORIZED);
    }

    const [stock, user] = await Promise.all([
      this._stockService.findOne(position.stock_code),
      this._appUserService.findOne(position.user_id),
    ]);

    const { quantity } = position;
    const { detail } = currentSession;
    const { transaction_fees } = detail.transactions_rate as any;
    const { P, M, N, ZT, DT } = stock;

    const amount = P * quantity;
    const actual_amount = amount * (1 - transaction_fees);

    const created_order = this._orderRepo.create({
      type: ORDER_TYPE.SELL,
      stock_code: position.stock_code,
      quantity: quantity,
      price: P,
      username: user.username,
      fee_rate: transaction_fees,
      amount: amount,
      actual_amount: actual_amount,
      user_id: position.user_id,
      stock_market: M,
      stock_name: N,
      zhangting: ZT,
      dieting: DT,
      trading_session: currentSession.id,
      trx_type: position.type,
    });

    const [newOrder, _, __] = await Promise.all([
      this._orderRepo.save(created_order),
      this._appUserService.updateBalance(user.id, {
        balance: +user.balance + +amount,
        balance_avail: +user.balance_avail + +amount,
      }),
      this._stockStorageService.update(position_id, {
        status: POSITION_STATUS.CLOSED,
      }),
    ]);

    const trxInfo = {
      trx_id: newOrder.id,
      type: TRANSACTION_TYPE.SELL,
      user_id: user.id,
      before: user.balance,
      after: +user.balance + +actual_amount,
    };

    await this._trxService.addTrx(trxInfo);

    return created_order;
  }

  async bulkSellNor(
    position_ids: number[],
    stock_code: string,
    user_id: number,
  ) {
    const [positions, currentSession] = await Promise.all([
      this._stockStorageService.findBulkSell(position_ids, stock_code, user_id),
      this._tradingSessionService.findOpeningSession(),
    ]);

    if (!currentSession) {
      throw new NotFoundException(MESSAGES.TRADING_SESSION_NOT_OPEN);
    }

    const [stock, user] = await Promise.all([
      this._stockService.findOne(stock_code),
      this._appUserService.findOne(user_id),
    ]);

    const { detail } = currentSession;
    const { transaction_fees } = detail.transactions_rate as any;
    const { P, M, N, ZT, DT } = stock;

    const orderInfos = [];
    let addAmount: number = 0;

    for (const position of positions) {
      const { quantity } = position;

      const amount = P * quantity;
      const actual_amount = amount * (1 - transaction_fees);

      const created_order = this._orderRepo.create({
        type: ORDER_TYPE.SELL,
        stock_code: stock_code,
        quantity: quantity,
        price: P,
        username: user.username,
        fee_rate: transaction_fees,
        amount: amount,
        actual_amount: actual_amount,
        user_id: user_id,
        stock_market: M,
        stock_name: N,
        zhangting: ZT,
        dieting: DT,
        trading_session: currentSession.id,
      });

      orderInfos.push(created_order);
      addAmount += +actual_amount;
    }

    const [orders, _, __] = await Promise.all([
      this._orderRepo.save(orderInfos),
      this._appUserService.updateBalance(user_id, {
        balance: +user.balance + addAmount,
        balance_avail: +user.balance_avail + addAmount,
      }),
      this._stockStorageService.closePositions(position_ids),
    ]);

    const trxInfos = [];
    let before: number = +user.balance;
    for (const index in orders) {
      let after: number = before + +orders[index].actual_amount;
      const trxInfo = {
        trx_id: orders[index].id,
        type: TRANSACTION_TYPE.SELL,
        user_id: orders[index].user_id,
        before,
        after,
      };
      before = after;
      trxInfos.push(trxInfo);
    }

    await this._trxService.addTrx(trxInfos);

    return orderInfos;
  }
}

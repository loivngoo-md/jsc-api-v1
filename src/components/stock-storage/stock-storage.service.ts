import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { POSITION_STATUS, SESSION_STATUS } from 'src/common/enums';
import { dateFormatter } from 'src/helpers/moment';
import { DeepPartial, MoreThanOrEqual, Repository } from 'typeorm';
import { PaginationQuery } from '../../helpers/dto-helper';
import {
  PositionQuery,
  SellablePositionsQuery,
} from '../../modules/app-user/dto/positions-pagination.dto';

import { StockService } from '../stock/stock.service';
import { StockStorage } from './entities/stock-storage.entity';

@Injectable()
export class StockStorageService {
  constructor(
    @InjectRepository(StockStorage)
    private readonly _stockStorageRepo: Repository<StockStorage>,
    private readonly _stockService: StockService,
  ) {}

  public async list_for_user(query: PaginationQuery, user_id: number) {
    const page = query['page'] || 1;
    const pageSize = query['pageSize'] || 10;

    const rec = await this._stockStorageRepo.find({
      where: { user_id },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      count: rec.length,
      data: rec,
    };
  }

  public async store(dto: DeepPartial<StockStorage>) {
    const existRec = await this._stockStorageRepo.findOne({
      where: {
        stock_code: dto['stock_code'],
        price: dto['price'],
        trading_session: dto['trading_session'],
      },
    });

    if (existRec) {
      existRec['quantity'] = +existRec['quantity'] + +dto['quantity'];
      existRec['amount'] = +existRec['amount'] + +dto['amount'];
      return await existRec.save();
    }

    const transaction = this._stockStorageRepo.create(dto);
    await this._stockStorageRepo.save(transaction);
    return transaction;
  }

  public async count_today_purchased(user_id: number, fs: string) {
    const today_timestamp = dateFormatter().valueOf();
    const today = new Date(today_timestamp);

    const positions = await this._stockStorageRepo.find({
      where: {
        user_id,
        stock_code: fs,
        status: POSITION_STATUS.OPEN,
        created_at: MoreThanOrEqual(today),
      },
    });
    const today_count = positions.reduce((count: number, position) => {
      count += +position.quantity;
      return count;
    }, 0);
    return today_count;
  }

  public async count_list_stock_purchased(user_id: number, fs: string) {
    const positions = await this._stockStorageRepo.find({
      where: {
        user_id,
        stock_code: fs,
        status: POSITION_STATUS.OPEN,
      },
    });

    const total_count = positions.reduce((count: number, position) => {
      count += +position.quantity;
      return count;
    }, 0);
    return total_count;
  }

  public async update(
    position_id: string | number,
    dto: DeepPartial<StockStorage>,
  ) {
    return this._stockStorageRepo.update(position_id, dto);
  }

  public findOne(position_id: number) {
    return this._stockStorageRepo.findOne({
      where: {
        id: position_id,
      },
    });
  }

  public async findUserPostions(
    user_id: string | number,
    query: PositionQuery,
  ) {
    const page = +query.page || 1;
    const pageSize = +query.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const positions = await this._stockStorageRepo
      .createQueryBuilder('ss')
      .innerJoinAndSelect('stocks', 's', 'ss.stock_code = s.FS')
      .innerJoinAndSelect('app_users', 'u', 'ss.user_id = u.id')
      .select([
        'ss.*',
        'row_to_json(u.*) as app_user',
        'row_to_json(s.*) as stock',
      ])
      .where({
        user_id: Number(user_id),
        status: POSITION_STATUS.OPEN,
      })
      .skip(skip)
      .take(pageSize)
      .getRawMany();

    return { data: positions, count: positions.length };
  }

  public async getSellablePositions(
    user_id: number,
    query: SellablePositionsQuery,
  ) {
    const positions = await this._stockStorageRepo
      .createQueryBuilder('ss')
      .innerJoinAndSelect(
        'trading-session',
        'ts',
        'ss.trading_session = ts.id::text',
      )
      .innerJoinAndSelect('stocks', 's', 'ss.stock_code = s.FS')
      .select(['ss.*', 'row_to_json(s.*) as stock'])
      .where(
        `ss.stock_code = '${query.stock_code}' and ts.status = '${SESSION_STATUS.CLOSED}' and ss.status = ${POSITION_STATUS.OPEN} and ss.user_id = ${user_id}`,
      )
      .getRawMany();

    return { data: positions, count: positions.length };
  }
}

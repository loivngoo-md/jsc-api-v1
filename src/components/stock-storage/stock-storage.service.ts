import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { COMMON_STATUS, POSITION_STATUS } from 'src/common/enums';
import { dateFormatter } from 'src/helpers/moment';
import { DeepPartial, In, MoreThanOrEqual, Repository } from 'typeorm';
import { PaginationQuery } from '../../helpers/dto-helper';
import { SellablePositionsQuery } from '../../modules/app-user/dto/app-user-query.dto';
import { MESSAGE } from './../../common/constant/index';

import { StockService } from '../stock/stock.service';
import { StockStorageStore } from './dto/stock-storage-create.dto';
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

  public async store(body: StockStorageStore) {
    const {
      user_id,
      stock_code,
      price,
      trading_session,
      quantity,
      amount,
      type,
    } = body;
    const existRec = await this._stockStorageRepo.findOne({
      where: {
        stock_code: stock_code,
        price: price,
        trading_session: trading_session,
        type,
      },
    });

    if (existRec) {
      existRec.quantity = +existRec.quantity + quantity;
      existRec.amount = +existRec.amount + amount;
      return await existRec.save();
    }

    const transaction = this._stockStorageRepo.create({
      user_id,
      stock_code,
      quantity,
      price,
      amount,
      trading_session,
      type,
    });
    await this._stockStorageRepo.save(transaction);

    return transaction;
  }

  public async count_today_purchased(user_id: number, fs: string) {
    const today = new Date().getTime();

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

  public async findOne(position_id: number) {
    return this._stockStorageRepo.findOne({
      where: {
        id: position_id,
      },
    });
  }

  public async findBulkSell(
    position_ids: number[],
    stock_code: string,
    user_id?: number,
  ) {
    const query = await this._stockStorageRepo
      .createQueryBuilder('ss')
      .innerJoinAndSelect('trading-session', 'ts', 'ss.trading-session = ts.id')
      .select(['ss.*', 'row_to_json(ts.*) as seesion_detail']);

    query.where(`ss.status = ${POSITION_STATUS.OPEN}`);
    query.andWhere(`ts.status = ${COMMON_STATUS.CLOSED}`);
    query.andWhere('ss.id IN (:...ids)', { ids: position_ids });
    query.andWhere(`ss.stock_code = ${stock_code}`);
    user_id && query.andWhere(`ss.user_id = ${user_id}`);

    const recs = await query.getRawMany();
    if (recs.length !== position_ids.length) {
      throw new NotFoundException(
        MESSAGE.notFoundError('Stock Storage', 'enought'),
      );
    }
    return recs;
  }

  public async findUserPostions(
    user_id: string | number,
    query: PaginationQuery,
  ) {
    const page = +query.page || 1;
    const pageSize = +query.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const positionsQuery = this._stockStorageRepo
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
      });

    const total = await positionsQuery.clone().getCount();
    const positions = await positionsQuery
      .offset(skip)
      .limit(pageSize)
      .getRawMany();

    return { data: positions, count: positions.length, total };
  }

  public async getSellablePositions(
    user_id: number,
    query: SellablePositionsQuery,
  ) {
    const take = +query.pageSize || 10;
    const skip = +query.pageSize * (+query.page - 1) || 0;

    await this._stockService.findOne(query.stock_code);
    const positionsQuery = this._stockStorageRepo
      .createQueryBuilder('ss')
      .innerJoinAndSelect(
        'trading-session',
        'ts',
        'ss.trading_session = ts.id::text',
      )
      .innerJoinAndSelect('stocks', 's', 'ss.stock_code = s.FS')
      .select(['ss.*', 'row_to_json(s.*) as stock'])
      .where(
        `ss.stock_code = '${query.stock_code}' AND 
        ts.status = '${COMMON_STATUS.CLOSED}' AND
        ss.status = ${POSITION_STATUS.OPEN} AND
        ss.user_id = ${user_id}`,
      );
    const total = await positionsQuery.clone().getCount();
    const positions = await positionsQuery.limit(take).offset(skip).getRawMany();

    return { data: positions, count: positions.length, total };
  }

  public async closePositions(position_ids: number[]) {
    const recs = await this._stockStorageRepo.find({
      where: { id: In([...position_ids]), status: POSITION_STATUS.OPEN },
    });
    if (recs.length !== position_ids.length) {
      throw new NotFoundException(
        MESSAGE.notFoundError('Stock Storage', 'enought'),
      );
    }
    await this._stockStorageRepo.update(
      { id: In([...position_ids]) },
      { status: POSITION_STATUS.CLOSED },
    );

    return { isSuccess: true };
  }
}

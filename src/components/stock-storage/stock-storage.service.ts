import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_TYPE, POSITION_STATUS } from 'src/common/enums';
import { dateFormatter } from 'src/helpers/moment';
import { DeepPartial, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { PositionQuery, SellablePositionsQuery } from '../../modules/app-user/dto/positions-pagination.dto';

import { StockService } from '../stock/stock.service';
import { StockStorage } from './entities/stock-storage.entity';

@Injectable()
export class StockStorageService {
  constructor(
    @InjectRepository(StockStorage)
    private readonly _stockStorageRepo: Repository<StockStorage>,
    private readonly _stockService: StockService,
  ) {}

  public async list_for_user(user_id: number) {
    return this._stockStorageRepo.find({ where: { user_id } });
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
    const pageSize = +query.ps || 20;
    const skip = (page - 1) * pageSize;
    const positions = await this._stockStorageRepo.find({
      where: {
        user_id: Number(user_id),
        status: POSITION_STATUS.OPEN,
      },
      skip,
      take: pageSize,
    });

    const stockCodes = positions.reduce((codes: string[], position) => {
      if (!codes.includes(position.stock_code)) {
        codes.push(position.stock_code);
      }
      return codes;
    }, []);

    const stocks = await this._stockService.getStocksUsingCodes(stockCodes);

    return { positions, stocks };
  }

  public async getSellablePositions(
    user_id: number,
    query: SellablePositionsQuery,
  ) {
    const today_timestamp = dateFormatter().valueOf();
    const today = new Date(today_timestamp);

    const positions = await this._stockStorageRepo.find({
      where: {
        user_id,
        stock_code: query.stock_code,
        status: POSITION_STATUS.OPEN,
        created_at: LessThan(today),
      },
    });

    const stocks = await this._stockService.getStocksUsingCodes([
      query.stock_code,
    ]);

    return { positions, stocks };
  }
}

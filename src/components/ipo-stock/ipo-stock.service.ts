import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { MESSAGE } from '../../common/constant';
import { IpoStockCreate } from './dto/create-ipo-stock.dto';
import { IpoStockListQuery } from './dto/ipo-stock-list-query.dto';
import { IpoStockUpdate } from './dto/update-ipo-stock.dto';
import { IpoStock } from './entities/ipo-stock.entity';

@Injectable()
export class IpoStockService {
  constructor(
    @InjectRepository(IpoStock)
    private readonly _ipoStockRepo: Repository<IpoStock>,
  ) {}

  async create(body: IpoStockCreate) {
    const {
      name,
      code,
      price,
      supply_quantity,
      type,
      is_active,
      subscribe_time,
      time_on_market,
      payment_time,
    } = body;

    const ipoStockExist = await this._ipoStockRepo.find({
      where: [{ name }, { code }],
    });
    if (ipoStockExist.length) {
      throw new BadRequestException(
        MESSAGE.isExistError('IPO Stock', 'with this Name or Code'),
      );
    }

    const ipoStockInfo = this._ipoStockRepo.create({
      name,
      code,
      price,
      supply_quantity,
      type,
      is_active,
      subscribe_time,
      time_on_market,
      payment_time,
    });
    await this._ipoStockRepo.save(ipoStockInfo);
    return ipoStockInfo;
  }

  async findAll(query: IpoStockListQuery) {
    const { is_active, name, code, page, pageSize } = query;

    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    const whereConditions: Object = { is_delete: false };

    typeof is_active !== 'undefined' &&
      Object.assign(whereConditions, { is_active });
    name && Object.assign(whereConditions, { name });
    code && Object.assign(whereConditions, { code });

    const total = await this._ipoStockRepo.countBy(whereConditions);
    const recs = await this._ipoStockRepo.find({
      where: whereConditions,
      take: take,
      skip: skip,
    });

    return {
      count: recs.length,
      data: recs,
      total,
    };
  }

  async findOne(id: number) {
    const ipoStock = await this._ipoStockRepo.findOne({
      where: { id, is_delete: false },
    });

    if (!ipoStock) {
      throw new NotFoundException(MESSAGE.notFoundError('IPO Stock'));
    }
    return ipoStock;
  }

  async update(id: number, body: IpoStockUpdate) {
    const {
      name,
      code,
      price,
      supply_quantity,
      type,
      is_active,
      subscribe_time,
      time_on_market,
      payment_time,
    } = body;
    const ipoStock = await this.findOne(id);
    const ipoStockExist = await this._ipoStockRepo.find({
      where: [
        { name, id: Not(id) },
        { code, id: Not(id) },
      ],
    });
    if (ipoStockExist.length) {
      throw new BadRequestException(
        MESSAGE.isExistError('IPO Stock', 'with this Name or Code'),
      );
    }

    name && Object.assign(ipoStock, { name });
    code && Object.assign(ipoStock, { code });
    price && Object.assign(ipoStock, { price });
    supply_quantity && Object.assign(ipoStock, { supply_quantity });
    type && Object.assign(ipoStock, { type });
    typeof is_active !== 'undefined' && Object.assign(ipoStock, { is_active });
    subscribe_time && Object.assign(ipoStock, { subscribe_time });
    time_on_market && Object.assign(ipoStock, { time_on_market });
    payment_time && Object.assign(ipoStock, { payment_time });

    await this._ipoStockRepo.save(ipoStock);
    return { isSuccess: true };
  }

  async remove(id: number) {
    const ipoStock = await this.findOne(id);
    ipoStock.is_delete = true;
    await this._ipoStockRepo.save(ipoStock);

    return { isSuccess: true };
  }
}

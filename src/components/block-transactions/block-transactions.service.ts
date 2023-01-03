import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockService } from '../stock/stock.service';
import { BlockTransactionQuery } from './dto/block-transaction-query.dto';
import { BlockTransactionCreate } from './dto/create-block-transaction.dto';
import { BlockTransactionUpdate } from './dto/update-block-transaction.dto';
import { BlockTransaction } from './entities/block-transaction.entity';

@Injectable()
export class BlockTransactionsService {
  constructor(
    @InjectRepository(BlockTransaction)
    private readonly _blockTrxRepo: Repository<BlockTransaction>,
    private readonly _stockService: StockService,
  ) {}

  async create(body: BlockTransactionCreate) {
    const { stock_code, quantity, trx_key, discount, start_time, end_time } =
      body;

    const stock = await this._stockService.findByC(stock_code.toString());
    const blockTrxInfo = this._blockTrxRepo.create({
      stock_code,
      stock_name: stock.N,
      quantity,
      trx_key,
      discount,
      start_time,
      end_time,
    });
    await this._blockTrxRepo.save(blockTrxInfo);

    return blockTrxInfo;
  }

  async findAll(query: BlockTransactionQuery) {
    const { page, pageSize, key_words } = query;
    console.log(query);
    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    const queryBuilder = this._blockTrxRepo
      .createQueryBuilder('bt')
      .innerJoinAndSelect('stocks', 's', 's.C = bt.stock_code::varchar')
      .select(['bt.*', 'row_to_json(s.*) as stock_detail'])
      .where(`bt.is_delete = false`);

    key_words &&
      queryBuilder.andWhere(
        `bt.stock_name LIKE '%${key_words}%' OR bt.stock_code LIKE '%${key_words}%'`,
      );

    const total = await queryBuilder.clone().getCount();
    const recs = await queryBuilder.limit(take).offset(skip).getRawMany();

    return {
      count: recs.length,
      data: recs,
      total,
    };
  }

  async findOne(id: number) {
    const blockTrx = await this._blockTrxRepo.findOne({
      where: { id, is_delete: false },
    });
    if (!blockTrx) {
      throw new NotFoundException('Not found block transaction');
    }

    return blockTrx;
  }

  async update(id: number, body: BlockTransactionUpdate) {
    const { quantity, trx_key, discount, start_time, end_time } = body;

    const blockTrx = await this.findOne(id);

    quantity && Object.assign(blockTrx, { quantity });
    trx_key && Object.assign(blockTrx, { trx_key });
    discount && Object.assign(blockTrx, { discount });
    start_time && Object.assign(blockTrx, { start_time });
    end_time && Object.assign(blockTrx, { end_time });

    await this._blockTrxRepo.save(blockTrx);

    return { isSuccess: true };
  }

  async remove(id: number) {
    const blockTrx = await this.findOne(id);

    blockTrx.is_delete = true;
    await this._blockTrxRepo.save(blockTrx);

    return { isSuccess: true };
  }
}
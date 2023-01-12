import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TRANSACTION_TYPE } from '../../common/enums';
import { PaginationQuery } from '../../helpers/dto-helper';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly _trxRepo: Repository<Transaction>,
  ) {}

  async addTrx(dto: any) {
    const info = this._trxRepo.create(dto);
    const response = await this._trxRepo.save(info);
    return response;
  }

  async findAll(
    query: PaginationQuery,
    app_user_id?: number,
    agent_path?: string,
  ) {
    const page = query['page'] || 1;
    const pageSize = query['pageSize'] || 10;

    const transactionsQuery = this._trxRepo
      .createQueryBuilder('t')
      .innerJoinAndSelect('app_users', 'u', 't.user_id = u.id')
      .innerJoinAndSelect('agent', 'ag', 'ag.id = u.agent')
      .leftJoinAndSelect(
        'orders',
        'o',
        `t.trx_id = o.id and t.type IN (${TRANSACTION_TYPE.BUY}, ${TRANSACTION_TYPE.SELL})`,
      )
      .leftJoinAndSelect(
        'deposit',
        'd',
        `t.trx_id = d.id and t.type = ${TRANSACTION_TYPE.DEPOSIT}`,
      )
      .leftJoinAndSelect(
        'withdraw',
        'w',
        `t.trx_id = w.id and t.type = ${TRANSACTION_TYPE.WITHDRAWAL}`,
      )
      .select([
        't.*',
        'row_to_json(u.*) as app_user',
        'row_to_json(o.*) as order',
        'row_to_json(d.*) as deposit',
        'row_to_json(w.*) as withdrawal',
      ])
      .where({});

    app_user_id && transactionsQuery.andWhere(`t.user_id = ${app_user_id}`);
    agent_path && transactionsQuery.andWhere(`ag.path ILIKE '%${agent_path}%'`);

    const total = await transactionsQuery.clone().getCount();
    const transactions = await transactionsQuery
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .getRawMany();
    return {
      data: transactions,
      count: transactions.length,
      total,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }
}

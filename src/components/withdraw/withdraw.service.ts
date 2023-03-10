import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DEPOSIT_WITHDRAWAL_STATUS, TRANSACTION_TYPE } from 'src/common/enums';
import { Repository } from 'typeorm';
import { MESSAGE } from '../../common/constant';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { SystemConfigurationService } from '../system-configuration/system-configuration.service';
import { TransactionsService } from './../transactions/transactions.service';
import { WithdrawalQuery } from './dto/query-withdrawal.dto';
import { Withdraw } from './entities/withdraw.entity';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(Withdraw)
    private readonly _withdrawRepo: Repository<Withdraw>,
    private readonly _appUserService: AppUserService,
    private readonly _sysConfigService: SystemConfigurationService,
    private readonly _trxService: TransactionsService,
  ) {}

  async create(dto: any, byCms?: boolean) {
    const { amount, username, withdraw_password } = dto;
    const user = await this._appUserService.findByUsername(username);
    const systemConfig = await this._sysConfigService.findOne();
    const { withdrawal_fees } = systemConfig['transactions_rate'] as any;
    const { withdrawal_max, withdrawal_min } = systemConfig[
      'deposits_and_withdrawals'
    ] as any;

    const comparePw = bcrypt.compareSync(
      withdraw_password,
      user.withdraw_password,
    );
    if (!byCms && !comparePw) {
      throw new BadRequestException(MESSAGE.WITHDRAWAL_WRONG_PASSWORD);
    }

    if (+amount < withdrawal_min || +amount > withdrawal_max) {
      throw new BadRequestException(
        `${MESSAGE.DEPOSIT_RANGE_VALID_IS} ${withdrawal_min}, ${withdrawal_max} `,
      );
    }

    if (+user['balance'] < +amount) {
      throw new BadRequestException(MESSAGE.NOT_ENOUGH_MONEY);
    }

    dto['user_id'] = user['id'];
    dto['fee_rate'] = withdrawal_fees;
    dto['actual_amount'] = +amount * (1 - withdrawal_fees / 100);

    await this._appUserService.updateBalance(user.id, {
      balance_frozen: +user['balance_frozen'] + +amount,
      balance_avail: +user['balance_avail'] - +amount,
    });
    const response = this._withdrawRepo.create(dto);
    await this._withdrawRepo.save(response);
    return response;
  }

  async findAll(query: WithdrawalQuery, user_id?: number, agent_path?: string) {
    const { page, pageSize, start_time, end_time, status, username } = query;

    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    const queryBuilder = this._withdrawRepo
      .createQueryBuilder('w')
      .innerJoin('app_users', 'u', 'w.user_id = u.id')
      .innerJoin('agent', 'ag', 'ag.id = u.agent')
      .select([
        'w.*',
        'row_to_json(u.*) as user_detail',
        'row_to_json(ag.*) as agent_detail',
      ])
      .where({});

    !user_id &&
      username &&
      queryBuilder.andWhere(`w.username ILIKE '%${username}%'`);
    user_id && queryBuilder.andWhere(`w.user_id = ${user_id}`);
    agent_path && queryBuilder.andWhere(`ag.path ILIKE '%${agent_path}%'`);

    typeof status !== 'undefined' &&
      queryBuilder.andWhere(`w.status = ${status}`);
    start_time && queryBuilder.andWhere(`w.created_at >= ${start_time}`);
    end_time && queryBuilder.andWhere(`w.created_at <= ${end_time}`);

    const total = await queryBuilder.clone().getCount();
    const recs = await queryBuilder
      .limit(take)
      .offset(skip)
      .orderBy('w.created_at', 'DESC')
      .getRawMany();

    return {
      count: recs.length,
      data: recs,
      total,
    };
  }

  async findOne(id: number) {
    const response = await this._withdrawRepo.findOne({ where: { id: id } });
    if (response) {
      return response;
    }
    throw new NotFoundException(
      MESSAGE.notFoundError('Withdrawal Transaction'),
    );
  }

  async reviewByCms(withdraw_id: number, dto: any) {
    const { status } = dto;
    const withdrawal = await this.findOne(withdraw_id);
    const { user_id, amount } = withdrawal;
    if (withdrawal.status !== DEPOSIT_WITHDRAWAL_STATUS.PENDING) {
      throw new BadRequestException(MESSAGE.WITHDRAWAL_NOT_PENDING);
    }
    const user = await this._appUserService.findOne(user_id);
    const { balance, balance_avail, balance_frozen } = user;
    if (status === DEPOSIT_WITHDRAWAL_STATUS.SUCCESS) {
      const trxInfo = {
        trx_id: withdraw_id,
        type: TRANSACTION_TYPE.WITHDRAWAL,
        user_id,
        before: +balance,
        after: +balance - +amount,
      };

      await Promise.all([
        this._withdrawRepo.update(withdraw_id, dto),
        this._trxService.addTrx(trxInfo),
        this._appUserService.updateBalance(user_id, {
          balance: +balance - +amount,
          balance_frozen: +balance_frozen - +amount,
        }),
      ]);
    } else {
      await Promise.all([
        this._withdrawRepo.update(withdraw_id, dto),
        this._appUserService.updateBalance(user_id, {
          balance_avail: +balance_avail + +amount,
          balance_frozen: +balance_frozen - +amount,
        }),
      ]);
    }

    return { isSuccess: true };
  }
}

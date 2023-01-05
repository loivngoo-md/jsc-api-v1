import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DEPOSIT_WITHDRAWAL_STATUS, TRANSACTION_TYPE } from 'src/common/enums';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
import { MESSAGE } from '../../common/constant';
import { AppUserService } from '../../modules/app-user/app-user.service';
import AppUser from '../../modules/app-user/entities/app-user.entity';
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

  async findAll(query: WithdrawalQuery, user_id?: number) {
    const page = query['page'] || 1;
    const pageSize = query['pageSize'] || 10;

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

    delete query['start_time'];
    delete query['end_time'];
    delete query['page'];
    delete query['pageSize'];

    const queryBuilder = this._withdrawRepo
      .createQueryBuilder('w')
      .innerJoin('app_users', 'u', 'w.user_id = u.id')
      .select(['w.*', 'row_to_json(u.*) as user_detail'])
      .where(query);

    const total = await queryBuilder.clone().getCount();
    const recs = await queryBuilder
      .limit(pageSize)
      .offset((page - 1) * pageSize)
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
    throw new NotFoundException(MESSAGE.notFoundError('Withdrawal Transaction'));
  }

  async reviewByCms(withdraw_id: number, dto: any) {
    const { status } = dto;
    const withdrawal = await this.findOne(withdraw_id);
    if (withdrawal['status'] !== DEPOSIT_WITHDRAWAL_STATUS.PENDING) {
      throw new BadRequestException(MESSAGE.WITHDRAWAL_NOT_PENDING);
    }
    const user = await this._appUserService.findOne(withdrawal['user_id']);
    if (status === DEPOSIT_WITHDRAWAL_STATUS.SUCCESS) {
      const trxInfo = {
        trx_id: withdraw_id,
        type: TRANSACTION_TYPE.WITHDRAWAL,
        user_id: withdrawal['user_id'],
        before: +user['balance'],
        after: +user['balance'] - +withdrawal['amount'],
      };

      await Promise.all([
        this._withdrawRepo.update(withdraw_id, dto),
        this._trxService.addTrx(trxInfo),
        this._appUserService.updateBalance(withdrawal['user_id'], {
          balance: +user['balance'] - +withdrawal['amount'],
          balance_frozen: 0,
        }),
      ]);
    } else {
      await Promise.all([
        this._withdrawRepo.update(withdraw_id, dto),
        this._appUserService.updateBalance(withdrawal['user_id'], {
          balance_avail: +user['balance_avail'] + +withdrawal['amount'],
          balance_frozen: 0,
        }),
      ]);
    }

    return { isSuccess: true };
  }
}

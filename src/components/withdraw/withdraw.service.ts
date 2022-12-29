import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { INVALID_PASSWORD } from 'src/common/constant/error-message';
import { DEPOSIT_WITHDRAWAL_STATUS, TRANSACTION_TYPE } from 'src/common/enums';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
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

  async validatePassword(
    user: AppUser,
    withdraw_password: string,
  ): Promise<boolean> {
    return bcrypt.compareSync(withdraw_password, user.withdraw_password);
  }

  async create(dto: any, byCms?: boolean) {
    const { amount, username } = dto;
    const user = await this._appUserService.findByUsername(username);
    const systemConfig = await this._sysConfigService.findOne();
    const { withdrawal_fees } = systemConfig['transactions_rate'] as any;
    const { withdrawal_max, withdrawal_min } = systemConfig[
      'deposits_and_withdrawals'
    ] as any;

    if (
      !byCms &&
      !(await this.validatePassword(user, dto['withdraw_password']))
    ) {
      throw new NotFoundException(INVALID_PASSWORD);
    }

    if (+amount < withdrawal_min || +amount > withdrawal_max) {
      throw new HttpException(
        `Withdrawal should be in range (${withdrawal_min}, ${withdrawal_max})`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (+user['balance'] < +amount) {
      throw new HttpException(
        'Do not enough money to withdraw.',
        HttpStatus.BAD_REQUEST,
      );
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

    const rec = await this._withdrawRepo
      .createQueryBuilder('w')
      .innerJoin('app_users', 'u', 'w.user_id = u.id')
      .select(['w.*', 'row_to_json(u.*) as user_detail'])
      .where(query)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .getRawMany();

    return {
      count: rec.length,
      data: rec,
    };
  }

  async findOne(id: number) {
    const response = await this._withdrawRepo.findOne({ where: { id: id } });
    if (response) {
      return response;
    }
    throw new HttpException('Withdraw not found', HttpStatus.NOT_FOUND);
  }

  async reviewByCms(withdraw_id: number, dto: any) {
    const { status } = dto;
    const withdrawal = await this.findOne(withdraw_id);
    if (withdrawal['status'] !== DEPOSIT_WITHDRAWAL_STATUS.PENDING) {
      throw new HttpException(
        'Withdrawal is not pending',
        HttpStatus.BAD_REQUEST,
      );
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

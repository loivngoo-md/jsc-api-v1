import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DEPOSIT_WITHDRAWAL_STATUS, TRANSACTION_TYPE } from 'src/common/enums';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
import { dateFormatter } from '../../helpers/moment';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { DepositAccountService } from '../deposit-account/deposit-account.service';
import { SystemConfigurationService } from '../system-configuration/system-configuration.service';
import { TransactionsService } from '../transactions/transactions.service';
import { DepositQuery } from './dto/query-deposit.dto';
import Deposit from './entities/deposit.entity';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly _depositRepo: Repository<Deposit>,
    private readonly _appUserService: AppUserService,
    private readonly _depositAccountService: DepositAccountService,
    private readonly _sysConfigService: SystemConfigurationService,
    private readonly _trxService: TransactionsService,
  ) {}

  async create(dto: any) {
    const { amount } = dto;
    if (dto['deposit_account_id']) {
      const depAcc = await this._depositAccountService.findOne(
        dto['deposit_account_id'],
      );
      if (!depAcc) {
        throw new NotFoundException('Deposit Account Not Found');
      }
    }
    const [user, sysConfig] = await Promise.all([
      this._appUserService.findOne(dto['user_id']),
      this._sysConfigService.findOne(),
    ]);
    const { deposit_max, deposit_min } = sysConfig[
      'deposits_and_withdrawals'
    ] as any;
    if (+amount < deposit_min || +amount > deposit_max) {
      throw new HttpException(
        `Deposit should be in range (${deposit_min}, ${deposit_max})`,
        HttpStatus.BAD_REQUEST,
      );
    }
    dto['username'] = user['username'];
    const response = this._depositRepo.create(dto);
    await this._depositRepo.save(response);
    return response;
  }

  async findAll(query: DepositQuery, user_id?: number) {
    const page = query['page'] || 1;
    const pageSize = query['pageSize'] || 10;

    const end_time = query['end_time']
      ? dateFormatter(query['end_time'])
      : dateFormatter();
    const start_time = query['start_time']
      ? dateFormatter(query['start_time'])
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

    const rec = await this._depositRepo
      .createQueryBuilder('d')
      .innerJoin('app_users', 'u', 'd.user_id = u.id')
      .select(['d.*', 'row_to_json(u.*) as user_detail'])
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
    const response = await this._depositRepo.findOne({ where: { id: id } });
    if (response) {
      return response;
    }
    throw new HttpException('Deposit not found', HttpStatus.NOT_FOUND);
  }

  async reviewByCms(deposit_id: number, dto: any) {
    const { status } = dto;
    const deposit = await this.findOne(deposit_id);
    if (deposit.status !== DEPOSIT_WITHDRAWAL_STATUS.PENDING) {
      throw new HttpException('Deposit is not pending', HttpStatus.BAD_REQUEST);
    }

    if (status === DEPOSIT_WITHDRAWAL_STATUS.SUCCESS) {
      const user = await this._appUserService.findOne(deposit['user_id']);
      const trxInfo = {
        trx_id: deposit_id,
        type: TRANSACTION_TYPE.DEPOSIT,
        user_id: deposit['user_id'],
        before: +user['balance'],
        after: +user['balance'] + +deposit['amount'],
      };
      await Promise.all([
        this._depositRepo.update(deposit_id, dto),
        this._trxService.addTrx(trxInfo),
        this._appUserService.updateBalance(user['id'], {
          balance: user['balance'] + deposit['amount'],
          balance_avail: user['balance_avail'] + deposit['amount'],
        }),
      ]);
    } else {
      await this._depositRepo.update(deposit_id, dto);
    }
    return { isSuccess: true };
  }
}

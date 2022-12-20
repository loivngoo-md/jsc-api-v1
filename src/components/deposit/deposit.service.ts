import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DEPOSIT_WITHDRAWAL_STATUS } from 'src/common/enums';
import {
  Between,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { DepositAccountService } from '../deposit-account/deposit-account.service';
import { SystemConfigurationService } from '../system-configuration/system-configuration.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
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
  ) {}

  async create(dto: any) {
    const { amount } = dto;
    const [user, _, sysConfig] = await Promise.all([
      this._appUserService.findOne(dto['user_id']),
      this._depositAccountService.findOne(dto['deposit_account_id']),
      this._sysConfigService.findOne(),
    ]);
    const { deposit_max, deposit_min } =
      sysConfig['deposits_and_withdrawals'][0];
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
    const limit = query['limit'] || 10;

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
    delete query['limit'];

    return this._depositRepo.find({
      where: query,
      take: limit,
      skip: (page - 1) * limit,
    });
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

      await Promise.all([
        this._depositRepo.update(deposit_id, dto),
        this._appUserService.update(user['id'], {
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

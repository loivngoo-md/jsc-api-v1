import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DEPOSIT_WITHDRAWAL_STATUS, TRANSACTION_TYPE } from 'src/common/enums';
import { Repository } from 'typeorm';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { DepositAccountService } from '../deposit-account/deposit-account.service';
import { SystemConfigurationService } from '../system-configuration/system-configuration.service';
import { TransactionsService } from '../transactions/transactions.service';
import { MESSAGE } from './../../common/constant/index';
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
        throw new NotFoundException(MESSAGE.notFoundError('Deposit Account'));
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
      throw new BadRequestException(
        `${MESSAGE.DEPOSIT_RANGE_VALID_IS} ${deposit_min}, ${deposit_max} `,
      );
    }
    dto['username'] = user['username'];
    const response = this._depositRepo.create(dto);
    await this._depositRepo.save(response);
    return response;
  }

  async findAll(query: DepositQuery, user_id?: number, agent_path?: string) {
    const {
      page,
      pageSize,
      start_time,
      end_time,
      username,
      status,
      is_virtual_deposit,
    } = query;

    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    const queryBuilder = this._depositRepo
      .createQueryBuilder('d')
      .innerJoin('app_users', 'u', 'd.user_id = u.id')
      .innerJoin('agent', 'ag', 'ag.id = u.agent')
      .select(['d.*', 'row_to_json(u.*) as user_detail'])
      .where({});

    !user_id &&
      username &&
      queryBuilder.andWhere(`d.username ILIKE '%${username}%'`);
    user_id && queryBuilder.andWhere(`d.user_id = ${user_id}`);
    agent_path && queryBuilder.andWhere(`ag.path LIKE '%${agent_path}%'`);
    typeof status !== 'undefined' &&
      queryBuilder.andWhere(`d.status = ${status}`);
    start_time && queryBuilder.andWhere(`d.created_at >= ${start_time}`);
    end_time && queryBuilder.andWhere(`d.created_at <= ${end_time}`);
    typeof is_virtual_deposit !== 'undefined' &&
      queryBuilder.andWhere(`d.is_virtual_deposit = ${is_virtual_deposit}`);

    const total = await queryBuilder.clone().getCount();
    const recs = await queryBuilder.limit(take).offset(skip).getRawMany();

    return {
      count: recs.length,
      data: recs,
      total,
    };
  }

  async findOne(id: number) {
    const response = await this._depositRepo.findOne({ where: { id: id } });
    if (response) {
      return response;
    }
    throw new NotFoundException(MESSAGE.notFoundError('Deposit Transaction'));
  }

  async reviewByCms(deposit_id: number, dto: any) {
    const { status } = dto;
    const deposit = await this.findOne(deposit_id);
    if (deposit.status !== DEPOSIT_WITHDRAWAL_STATUS.PENDING) {
      throw new BadRequestException(MESSAGE.DEPOSIT_NOT_PENDING);
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

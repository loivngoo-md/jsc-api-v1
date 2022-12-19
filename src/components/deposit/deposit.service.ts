import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DEPOSIT_WITHDRAWAL_STATUS } from 'src/common/enums';
import { Repository } from 'typeorm';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { DepositAccountService } from '../deposit-account/deposit-account.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import Deposit from './entities/deposit.entity';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly _depositRepo: Repository<Deposit>,
    private readonly _appUserService: AppUserService,
    private readonly _depositAccountService: DepositAccountService,
  ) {}

  async create(dto: CreateDepositDto) {
    const [user, _] = await Promise.all([
      this._appUserService.findOne(dto['user_id']),
      this._depositAccountService.findOne(dto['deposit_account_id']),
    ]);
    dto['username'] = user['username'];
    const response = this._depositRepo.create(dto);
    await this._depositRepo.save(response);
    return response;
  }

  async findAll(query: any, user_id?: number) {
    const whereConditions = {};
    user_id && Object.assign(whereConditions, { user_id: user_id });
    return this._depositRepo.find({ where: whereConditions });
  }

  async findOne(id: number) {
    const response = await this._depositRepo.findOne({ where: { id: id } });
    if (response) {
      return response;
    }
    throw new HttpException('Deposit not found', HttpStatus.NOT_FOUND);
  }

  async reviewByCms(deposit_id: number, isAccept: boolean) {
    const deposit = await this.findOne(deposit_id);
    if (deposit.status !== DEPOSIT_WITHDRAWAL_STATUS.PENDING) {
      throw new HttpException('Deposit is not pending', HttpStatus.BAD_REQUEST);
    }
    if (isAccept) {
      const user = await this._appUserService.findOne(deposit['user_id']);

      await Promise.all([
        this._appUserService.update(user['id'], {
          balance: user['balance'] + deposit['amount'],
          balance_avail: user['balance_avail'] + deposit['amount'],
        }),
        this._depositRepo.update(deposit_id, {
          status: DEPOSIT_WITHDRAWAL_STATUS.SUCCESS,
        }),
      ]);
    } else {
      await this._depositRepo.update(deposit_id, {
        status: DEPOSIT_WITHDRAWAL_STATUS.FAIL,
      });
    }
    return { isSuccess: true };
  }
}

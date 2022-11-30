import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdraw } from './entities/withdraw.entity';
import { AppUserService } from '../app-user/app-user.service';
import { PayLoad } from '../auth/dto/PayLoad';
import CmsUser from '../cms-user/entities/cms-user.entity';
import AppUser from '../app-user/entities/app-user.entity';
import * as bcrypt from 'bcryptjs';
import { INVALID_PASSWORD } from 'src/common/constant/error-message';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(Withdraw)
    private readonly _withdrawRepo: Repository<Withdraw>,
    private readonly _appUserService: AppUserService,
  ) { }

  async approve(withdraw_id: number, user_id: number, amount: number) {
    await this._withdrawRepo.update({ id: withdraw_id }, { is_approved: true });
    await this._appUserService.update(user_id, {
      is_freeze: true,
      balance_frozen: amount,
    });
  }

  async cmsPerformWithdraw(dto: CreateWithdrawDto) {
    const user = await this._appUserService.findByUsername(dto['username']);
    const { balance } = user;
    const compare = balance - dto['amount'];

    if (compare < 0) {
      throw new HttpException(
        'Do not enough money to withdraw.',
        HttpStatus.BAD_REQUEST,
      );
    }
    dto['before'] = balance;
    dto['after'] = compare
    await this._appUserService.update(user.id, { balance: compare });
    const response = this._withdrawRepo.create(dto);
    await this._withdrawRepo.save(response);
    return response;
  }

  async validatePassword(
    user: AppUser,
    withdraw_password: string,
  ): Promise<boolean> {
    return bcrypt.compareSync(withdraw_password, user.withdraw_password);
  }

  async userPerformWithdraw(dto: any, userFromToken: PayLoad) {
    const { username } = userFromToken;



    dto['username'] = username;
    dto['created_at'] = new Date();
    const { amount } = dto;
    const user = await this._appUserService.findByUsername(username);
    if (!(await this.validatePassword(user, dto['withdraw_password']))) {
      throw new NotFoundException(INVALID_PASSWORD);
    }

    const { balance } = user;

    const compare = Number(balance) - Number(amount);

    if (compare < 0) {
      throw new HttpException(
        'Do not enough money to withdraw.',
        HttpStatus.BAD_REQUEST,
      );
    }
    dto['before'] = balance;
    dto['after'] = compare.toString();
    await this._appUserService.update(user.id, {
      balance_frozen: amount,
      balance: compare,
      is_freeze: true,
    });
    const response = this._withdrawRepo.create(dto);
    await this._withdrawRepo.save(response);
    return response;
  }

  async findAll(user: PayLoad) {
    return this._withdrawRepo.find({ where: { username: user.username } });
  }

  async findOne(id: number) {
    const response = await this._withdrawRepo.findOne({ where: { id: id } });
    if (response) {
      return response;
    }
    throw new HttpException('Withdraw not found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, dto: UpdateWithdrawDto) {
    await this._withdrawRepo.update(id, dto);
    const updated = await this._withdrawRepo.findOne({ where: { id: id } });
    if (updated) {
      return updated;
    }
    throw new HttpException('Withdraw not found', HttpStatus.NOT_FOUND);
  }

  async remove(id: number) {
    const deleteResponse = await this._withdrawRepo.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Withdraw not found', HttpStatus.NOT_FOUND);
    }
  }
}

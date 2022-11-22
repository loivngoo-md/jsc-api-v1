import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdraw } from './entities/withdraw.entity';
import { AppUserService } from '../app-user/app-user.service';
import { PayLoad } from '../auth/dto/PayLoad';
import { cp } from 'fs';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(Withdraw)
    private readonly _withdrawRepo: Repository<Withdraw>,
    private readonly _appUserService: AppUserService
  ) { }

  async approve(withdraw_id: number, user_id: number, amount: string) {
    await this._withdrawRepo.update({ id: withdraw_id }, { isApproved: true })
    await this._appUserService.update(user_id, { is_freeze: true, balance_frozen: amount })
  }

  async cmsPerformWithdraw(dto: any) {

    dto['created_at'] = new Date()
    const { amount } = dto
    const user = await this._appUserService.findByUsername(dto.username)
    let { balance } = user
    const compare = parseFloat(balance) - parseFloat(amount)

    if (compare < 0) {
      throw new HttpException('Do not enough money to withdraw.', HttpStatus.BAD_REQUEST)
    }
    dto['before'] = balance
    dto['after'] = compare.toString()
    await this._appUserService.update(user.id, { balance: compare.toString() })
    const response = this._withdrawRepo.create(dto);
    await this._withdrawRepo.save(response);
    return response;
  }

  async userPerformWithdraw(dto: any, userFromToken: PayLoad) {
    const { username } = userFromToken

    dto['username'] = username
    dto['created_at'] = new Date()
    const { amount } = dto
    const user = await this._appUserService.findByUsername(username)
    let { balance } = user

    const compare = parseFloat(balance) - parseFloat(amount)

    if (compare < 0) {
      throw new HttpException('Do not enough money to withdraw.', HttpStatus.BAD_REQUEST)
    }
    dto['before'] = balance
    dto['after'] = compare.toString()
    await this._appUserService.update(user.id, {
      balance_frozen: amount,
      balance: compare.toString(),
      is_freeze: true,
    })
    const response = this._withdrawRepo.create(dto);
    await this._withdrawRepo.save(response);
    return response;
  }

  async findAll() {
    return this._withdrawRepo.find()
  }

  async findOne(id: number) {
    const response = await this._withdrawRepo.findOne({ where: { id: id } })
    if (response) {
      return response;
    }
    throw new HttpException('Withdraw not found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, dto: UpdateWithdrawDto) {
    await this._withdrawRepo.update(id, dto);
    const updated = await this._withdrawRepo.findOne({ where: { id: id } });
    if (updated) {
      return updated
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

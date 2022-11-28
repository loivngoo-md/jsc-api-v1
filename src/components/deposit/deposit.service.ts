import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppUserService } from '../app-user/app-user.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import Deposit from './entities/deposit.entity';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly _depositRepo: Repository<Deposit>,
    private readonly _appUserService: AppUserService,
  ) { }

  async create(dto: CreateDepositDto) {
    const response = this._depositRepo.create(dto);
    let user = await this._appUserService.findOne(dto['user_id']);
    const balance = user['balance'] + dto['amount']
    console.log(balance);

    await this._appUserService.update(dto['user_id'], { balance });
    await this._depositRepo.save(response);
    return response;
  }

  async findAll(
    user_id: number
  ) {
    return this._depositRepo.find({ where: { user_id } });
  }

  async findOne(id: number) {
    const response = await this._depositRepo.findOne({ where: { id: id } });
    if (response) {
      return response;
    }
    throw new HttpException('Deposit not found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, dto: UpdateDepositDto) {
    await this._depositRepo.update(id, dto);
    const updated = await this._depositRepo.findOne({ where: { id: id } });
    if (updated) {
      return updated;
    }
    throw new HttpException('Deposit not found', HttpStatus.NOT_FOUND);
  }

  async remove(id: number) {
    const deleteResponse = await this._depositRepo.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Deposit not found', HttpStatus.NOT_FOUND);
    }
  }
}

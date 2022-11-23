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
    private readonly _appUserRepo: AppUserService,
  ) {}

  async create(dto: CreateDepositDto) {
    const response = this._depositRepo.create(dto);
    const { balance } = await this._appUserRepo.findOne(dto['id']);
    const newBalance = Number(dto['amount']) + Number(balance);
    await this._appUserRepo.update(dto['id'], { balance: newBalance });
    await this._depositRepo.save(response);
    return response;
  }

  async findAll() {
    return this._depositRepo.find();
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

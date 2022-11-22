import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepositAccountDto } from './dto/create-deposit-account.dto';
import { UpdateDepositAccountDto } from './dto/update-deposit-account.dto';
import DepositAccount from './entities/deposit-account.entity';

@Injectable()
export class DepositAccountService {

  constructor(
    @InjectRepository(DepositAccount)
    private readonly _depositAccountRepo: Repository<DepositAccount>
  ) { }

  async create(dto: CreateDepositAccountDto) {
    dto.created_at = new Date()
    const response = await this._depositAccountRepo.create(dto);
    await this._depositAccountRepo.save(response);
    return response;
  }

  async findAll() {
    return this._depositAccountRepo.find()
  }

  async findOne(id: number) {
    const response = await this._depositAccountRepo.findOne({ where: { id: id } })
    if (response) {
      return response;
    }
    throw new HttpException('Deposit account not found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, dto: UpdateDepositAccountDto) {
    await this._depositAccountRepo.update(id, dto);
    const updated = await this._depositAccountRepo.findOne({ where: { id: id } });
    if (updated) {
      return updated
    }
    throw new HttpException('Deposit account not found', HttpStatus.NOT_FOUND);
  }

  async remove(id: number) {
    const deleteResponse = await this._depositAccountRepo.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Deposit account not found', HttpStatus.NOT_FOUND);
    }
  }
}

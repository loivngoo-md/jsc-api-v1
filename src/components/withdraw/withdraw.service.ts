import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdraw } from './entities/withdraw.entity';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(Withdraw)
    private readonly _withdrawRepo: Repository<Withdraw>
  ) { }

  async create(dto: CreateWithdrawDto) {
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

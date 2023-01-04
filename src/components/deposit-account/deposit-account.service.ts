import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MESSAGE } from './../../common/constant/index';
import DepositAccount from './entities/deposit-account.entity';

@Injectable()
export class DepositAccountService {
  constructor(
    @InjectRepository(DepositAccount)
    private readonly _depositAccountRepo: Repository<DepositAccount>,
  ) {}

  async create(dto: any) {
    dto.created_at = new Date();
    const response = this._depositAccountRepo.create(dto);
    await this._depositAccountRepo.save(response);
    return response;
  }

  async findAll() {
    const rec = await this._depositAccountRepo.find();
    return {
      count: rec.length,
      data: rec,
    };
  }

  async findOne(id: number) {
    const response = await this._depositAccountRepo.findOne({
      where: { id: id },
    });
    if (response) {
      return response;
    }
    throw new BadRequestException(MESSAGE.BAD_REQUEST);
  }

  async update(id: number, dto: any) {
    await this._depositAccountRepo.update(id, dto);
    const updated = await this._depositAccountRepo.findOne({
      where: { id: id },
    });
    if (updated) {
      return updated;
    }

    throw new BadRequestException(MESSAGE.BAD_REQUEST);
  }

  async remove(id: number) {
    const deleteResponse = await this._depositAccountRepo.delete(id);
    if (!deleteResponse.affected) {
      throw new BadRequestException(MESSAGE.BAD_REQUEST);
    }

    return {
      success: true,
      status: HttpStatus.OK,
    };
  }
}

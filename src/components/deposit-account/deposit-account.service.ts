import { Injectable } from '@nestjs/common';
import { CreateDepositAccountDto } from './dto/create-deposit-account.dto';
import { UpdateDepositAccountDto } from './dto/update-deposit-account.dto';

@Injectable()
export class DepositAccountService {
  create(createDepositAccountDto: CreateDepositAccountDto) {
    return 'This action adds a new depositAccount';
  }

  findAll() {
    return `This action returns all depositAccount`;
  }

  findOne(id: number) {
    return `This action returns a #${id} depositAccount`;
  }

  update(id: number, updateDepositAccountDto: UpdateDepositAccountDto) {
    return `This action updates a #${id} depositAccount`;
  }

  remove(id: number) {
    return `This action removes a #${id} depositAccount`;
  }
}

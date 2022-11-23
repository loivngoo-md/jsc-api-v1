import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Transaction from './entities/transaction.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private _transactionRepo: Repository<Transaction>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const newTransaction = await this._transactionRepo.create(
      createTransactionDto,
    );
    await this._transactionRepo.save(newTransaction);
    return newTransaction;
  }

  async findAll() {
    return this._transactionRepo.find();
  }

  async findOne(id: number) {
    const transaction = await this._transactionRepo.findOne({
      where: { id: id },
    });
    if (transaction) {
      return transaction;
    }
    throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {}

  async remove(id: number) {
    const deleteResponse = await this._transactionRepo.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import MoneyLog from './entities/money-log.entity';

@Injectable()
export class MoneyLogService {
  constructor(
    @InjectRepository(MoneyLog)
    private _MoneyLogRepo: Repository<MoneyLog>,
  ) {}

  async insert(dto) {
    const newLog = this._MoneyLogRepo.create(dto);
    await this._MoneyLogRepo.save(newLog);
    return newLog;
  }

  async list(user_id: number) {
    return this._MoneyLogRepo.find({
      where: { user_id },
    });
  }
}

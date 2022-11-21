import { Injectable } from '@nestjs/common';
import MoneyLog from './entities/money-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class MoneyLogService {
    constructor(
        @InjectRepository(MoneyLog)
        private _MoneyLogRepo: Repository<MoneyLog>,
    ) { }

    async insert(dto) {
        const newLog = this._MoneyLogRepo.create(dto);
        await this._MoneyLogRepo.save(newLog);
        return newLog;
    }

    async list() {
        return this._MoneyLogRepo.find()
    }
}

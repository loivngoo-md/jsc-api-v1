import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import LoginRecord from './entities/login-record.entity';
@Injectable()
export class LoginRecordService {
    constructor(
        @InjectRepository(LoginRecord)
        private _loginRecordRepo: Repository<LoginRecord>,
    ) { }

    async insert(dto) {
        const record = await this._loginRecordRepo.create(dto);
        await this._loginRecordRepo.save(record);
        return record;
    }

    async list() {
        return this._loginRecordRepo.find()
    }
}
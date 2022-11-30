import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { StockStorage } from './entities/stock-storage.entity';

@Injectable()
export class StockStorageService {
    constructor(
        @InjectRepository(StockStorage)
        private readonly _stockStorageRepo: Repository<StockStorage>
    ) { }


    public async list_for_user(user_id: number) {
        return this._stockStorageRepo.find({ where: { user_id } })

    }

    public async store(dto: DeepPartial<StockStorage>) {
        const transaction = this._stockStorageRepo.create(dto)
        await this._stockStorageRepo.save(transaction)
        return transaction
    }
}

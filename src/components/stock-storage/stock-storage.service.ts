import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_TYPE } from 'src/common/enums';
import { DeepPartial, MoreThanOrEqual, Repository } from 'typeorm';
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

    public async count_today_purchased(user_id: number, fs: string) {

        const today_timestamp = new Date().setHours(16, 0, 0)
        const today = new Date(today_timestamp)
        console.log(today);
        

        const list_stock = await this._stockStorageRepo.find({
            where: {
                user_id,
                stock_code: fs,
                type: ORDER_TYPE.BUY,
                created_at: MoreThanOrEqual(today)
            }
        })
        return list_stock.length
    }

    public async count_list_stock_purchased(user_id: number, fs: string) {
        const list_stock = await this._stockStorageRepo.find({
            where: {
                user_id,
                stock_code: fs,
                type: ORDER_TYPE.BUY
            }
        })
        return list_stock.length
    }
}

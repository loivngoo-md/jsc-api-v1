import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockStorage } from './entities/stock-storage.entity';
import { StockStorageController } from './stock-storage.controller';
import { StockStorageService } from './stock-storage.service';

@Module({
    imports: [TypeOrmModule.forFeature([StockStorage])],
    controllers: [StockStorageController],
    providers: [StockStorageService],
})
export class StockStorageModule { }

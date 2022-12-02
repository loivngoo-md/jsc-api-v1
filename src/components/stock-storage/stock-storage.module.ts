import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockModule } from '../stock/stock.module';
import { StockStorage } from './entities/stock-storage.entity';
import { StockStorageController } from './stock-storage.controller';
import { StockStorageService } from './stock-storage.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([StockStorage]),
        forwardRef(() => StockModule),
    ],
    controllers: [StockStorageController],
    providers: [StockStorageService],
    exports: [StockStorageService]
})
export class StockStorageModule { }

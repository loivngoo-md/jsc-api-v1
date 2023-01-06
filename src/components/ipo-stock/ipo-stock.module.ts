import { StockModule } from '../stock/stock.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpoStock } from './entities/ipo-stock.entity';
import { IpoStockService } from './ipo-stock.service';

@Module({
  imports: [TypeOrmModule.forFeature([IpoStock]), StockModule],
  providers: [IpoStockService],
  exports: [IpoStockService],
})
export class IpoStockModule {}

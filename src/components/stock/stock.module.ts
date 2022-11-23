import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import Stock from './entities/stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stock]), HttpModule],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}

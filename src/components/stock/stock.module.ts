import { forwardRef, Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import Stock from './entities/stock.entity';
import { OrderModule } from '../order/order.module';
import { StockStorageModule } from '../stock-storage/stock-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock]),
    HttpModule,
    forwardRef(()=> OrderModule),
    forwardRef(() => StockStorageModule),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}

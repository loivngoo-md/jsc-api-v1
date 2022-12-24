import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { StockStorageModule } from '../stock-storage/stock-storage.module';
import Stock from './entities/stock.entity';
import { StockService } from './stock.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock]),
    HttpModule,
    forwardRef(() => OrderModule),
    forwardRef(() => StockStorageModule),
  ],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}

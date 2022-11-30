import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { StockModule } from '../stock/stock.module';
import { AppUserModule } from '../app-user/app-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    StockModule,
    AppUserModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule { }

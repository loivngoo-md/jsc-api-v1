import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { StockModule } from '../stock/stock.module';
import { StockStorageModule } from '../stock-storage/stock-storage.module';
import { TradingSessionModule } from '../trading-session/trading-session.module';
import { AppUserModule } from '../../modules/app-user/app-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => StockModule),
    forwardRef(() => AppUserModule),
    TradingSessionModule,
    forwardRef(() =>StockStorageModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUserModule } from '../../modules/app-user/app-user.module';
import { StockStorageModule } from '../stock-storage/stock-storage.module';
import { StockModule } from '../stock/stock.module';
import { TradingSessionModule } from '../trading-session/trading-session.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => StockModule),
    forwardRef(() => AppUserModule),
    TradingSessionModule,
    forwardRef(() => StockStorageModule),
    TransactionsModule,
  ],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

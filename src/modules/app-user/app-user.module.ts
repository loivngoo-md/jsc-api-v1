import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../components/auth/auth.module';
import { DepositAccountModule } from '../../components/deposit-account/deposit-account.module';
import { MoneyLogModule } from '../../components/money-log/money-log.module';
import { StockStorageModule } from '../../components/stock-storage/stock-storage.module';
import { TransactionsModule } from '../../components/transactions/transactions.module';
import { AgentModule } from '../agent/agent.module';
import { BlockTransactionsModule } from './../../components/block-transactions/block-transactions.module';
import { DepositModule } from './../../components/deposit/deposit.module';
import { FavoriteStockModule } from './../../components/favorite-stock/favorite-stock.module';
import { IpoApplicationModule } from './../../components/ipo-application/ipo-application.module';
import { IpoStockModule } from './../../components/ipo-stock/ipo-stock.module';
import { OrderModule } from './../../components/order/order.module';
import { StockModule } from './../../components/stock/stock.module';
import { TradingSessionModule } from './../../components/trading-session/trading-session.module';
import { WithdrawModule } from './../../components/withdraw/withdraw.module';
import { AppUserController } from './app-user.controller';
import { AppUserService } from './app-user.service';
import AppUser from './entities/app-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppUser]),
    forwardRef(() => AuthModule),
    forwardRef(() => AgentModule),
    OrderModule,
    forwardRef(() => WithdrawModule),
    DepositAccountModule,
    forwardRef(() => DepositModule),
    StockStorageModule,
    FavoriteStockModule,
    TradingSessionModule,
    StockModule,
    MoneyLogModule,
    TransactionsModule,
    BlockTransactionsModule,
    IpoStockModule,
    forwardRef(() => IpoApplicationModule),
  ],
  controllers: [AppUserController],
  providers: [AppUserService],
  exports: [AppUserService],
})
export class AppUserModule {}

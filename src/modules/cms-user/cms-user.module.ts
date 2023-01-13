import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../components/auth/auth.module';
import { BlockTransactionsModule } from '../../components/block-transactions/block-transactions.module';
import { StockModule } from '../../components/stock/stock.module';
import { TransactionsModule } from '../../components/transactions/transactions.module';
import { WithdrawModule } from '../../components/withdraw/withdraw.module';
import { AgentModule } from '../agent/agent.module';
import { AppUserModule } from '../app-user/app-user.module';
import { DepositAccountModule } from './../../components/deposit-account/deposit-account.module';
import { DepositModule } from './../../components/deposit/deposit.module';
import { IpoApplicationModule } from './../../components/ipo-application/ipo-application.module';
import { IpoStockModule } from './../../components/ipo-stock/ipo-stock.module';
import { LoginRecordModule } from './../../components/login-record/login-record.module';
import { MoneyLogModule } from './../../components/money-log/money-log.module';
import { OrderModule } from './../../components/order/order.module';
import { SystemConfigurationModule } from './../../components/system-configuration/system-configuration.module';
import { TradingSessionModule } from './../../components/trading-session/trading-session.module';
import { CmsUserController } from './cms-user.controller';
import { CmsUserService } from './cms-user.service';
import CmsUser from './entities/cms-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CmsUser]),
    forwardRef(() => AuthModule),
    AppUserModule,
    MoneyLogModule,
    OrderModule,
    DepositModule,
    WithdrawModule,
    LoginRecordModule,
    StockModule,
    SystemConfigurationModule,
    TradingSessionModule,
    DepositAccountModule,
    TransactionsModule,
    AgentModule,
    IpoStockModule,
    BlockTransactionsModule,
    IpoApplicationModule
  ],
  controllers: [CmsUserController],
  providers: [CmsUserService],
  exports: [CmsUserService],
})
export class CmsUserModule {}

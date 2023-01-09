import { CmsUserModule } from './../../modules/cms-user/cms-user.module';
import { StockStorageModule } from '../stock-storage/stock-storage.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUserModule } from '../../modules/app-user/app-user.module';
import { IpoStockModule } from '../ipo-stock/ipo-stock.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { IpoApplication } from './entities/ipo-application.entity';
import { IpoApplicationService } from './ipo-application.service';
import { TradingSessionModule } from '../trading-session/trading-session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IpoApplication]),
    forwardRef(() => AppUserModule),
    IpoStockModule,
    TransactionsModule,
    TradingSessionModule,
    StockStorageModule,
  ],
  providers: [IpoApplicationService],
  exports: [IpoApplicationService],
})
export class IpoApplicationModule {}

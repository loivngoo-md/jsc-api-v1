import { forwardRef, Module } from '@nestjs/common';
import { AppUserService } from './app-user.service';
import { AppUserController } from './app-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppUser from './entities/app-user.entity';
import { FavoriteStockModule } from 'src/components/favorite-stock/favorite-stock.module';
import { StockStorageModule } from '../../components/stock-storage/stock-storage.module';
import { DepositModule } from '../../components/deposit/deposit.module';
import { WithdrawModule } from '../../components/withdraw/withdraw.module';
import { OrderModule } from '../../components/order/order.module';
import { CmsUserModule } from '../cms-user/cms-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppUser]),
    forwardRef(() => OrderModule),
    WithdrawModule,
    forwardRef(() => StockStorageModule),
    FavoriteStockModule,
    DepositModule,
  ],
  controllers: [AppUserController],
  providers: [AppUserService],
  exports: [AppUserService],
})
export class AppUserModule {}

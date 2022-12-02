import { forwardRef, Module } from '@nestjs/common';
import { AppUserService } from './app-user.service';
import { AppUserController } from './app-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppUser from './entities/app-user.entity';
import { LocalFileModule } from '../local-file/local-file.module';
import { OrderModule } from '../order/order.module';
import { WithdrawModule } from '../withdraw/withdraw.module';
import { DepositModule } from '../deposit/deposit.module';
import { StockStorageModule } from '../stock-storage/stock-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppUser]),
    LocalFileModule,
    forwardRef(() => OrderModule),
    forwardRef(() => WithdrawModule),
    forwardRef(() => DepositModule),
    StockStorageModule,
    
  ],
  controllers: [AppUserController],
  providers: [AppUserService],
  exports: [AppUserService],
})
export class AppUserModule { }

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUserModule } from '../../modules/app-user/app-user.module';
import { DepositAccountModule } from '../deposit-account/deposit-account.module';
import { SystemConfigurationModule } from '../system-configuration/system-configuration.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { DepositService } from './deposit.service';
import Deposit from './entities/deposit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit]),
    forwardRef(() => AppUserModule),
    DepositAccountModule,
    SystemConfigurationModule,
    TransactionsModule,
  ],
  providers: [DepositService],
  exports: [DepositService],
})
export class DepositModule {}

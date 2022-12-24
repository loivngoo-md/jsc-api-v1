import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUserModule } from '../../modules/app-user/app-user.module';
import { SystemConfigurationModule } from '../system-configuration/system-configuration.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { Withdraw } from './entities/withdraw.entity';
import { WithdrawService } from './withdraw.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdraw]),
    forwardRef(() => AppUserModule),
    SystemConfigurationModule,
    TransactionsModule,
  ],
  providers: [WithdrawService],
  exports: [WithdrawService],
})
export class WithdrawModule {}

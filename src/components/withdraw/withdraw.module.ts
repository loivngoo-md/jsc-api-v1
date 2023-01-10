import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentModule } from '../../modules/agent/agent.module';
import { AppUserModule } from '../../modules/app-user/app-user.module';
import { SystemConfigurationModule } from '../system-configuration/system-configuration.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { Withdraw } from './entities/withdraw.entity';
import { WithdrawService } from './withdraw.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdraw]),
    forwardRef(() => AppUserModule),
    // forwardRef(() => AgentModule),
    SystemConfigurationModule,
    TransactionsModule,
  ],
  providers: [WithdrawService],
  exports: [WithdrawService],
})
export class WithdrawModule {}

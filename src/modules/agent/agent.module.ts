import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../components/auth/auth.module';
import { DepositModule } from '../../components/deposit/deposit.module';
import { MoneyLogModule } from '../../components/money-log/money-log.module';
import { OrderModule } from '../../components/order/order.module';
import { TransactionsModule } from '../../components/transactions/transactions.module';
import { WithdrawModule } from '../../components/withdraw/withdraw.module';
import { AppUserModule } from '../../modules/app-user/app-user.module';
import { AgentUserController } from './agent.controller';
import { AgentService } from './agent.service';
import { Agent } from './entities/agent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agent]),
    forwardRef(() => AuthModule),
    forwardRef(() => AppUserModule),
    DepositModule,
    WithdrawModule,
    OrderModule,
    TransactionsModule,
    MoneyLogModule,
  ],
  providers: [AgentService],
  controllers: [AgentUserController],
  exports: [AgentService],
})
export class AgentModule {}

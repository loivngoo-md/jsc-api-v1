import { AppUserModule } from './../../modules/app-user/app-user.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MoneyLogModule } from '../money-log/money-log.module';
import { AgentUserController } from './agent.controller';
import { AgentService } from './agent.service';
import { Agent } from './entities/agent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agent]),
    MoneyLogModule,
    forwardRef(() => AuthModule),
    forwardRef(() => AppUserModule),
  ],
  providers: [AgentService],
  controllers: [AgentUserController],
  exports: [AgentService],
})
export class AgentModule {}

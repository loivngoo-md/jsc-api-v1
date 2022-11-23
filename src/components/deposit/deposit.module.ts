import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Deposit from './entities/deposit.entity';
import { AppUserModule } from '../app-user/app-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Deposit]), AppUserModule],
  controllers: [DepositController],
  providers: [DepositService],
})
export class DepositModule {}

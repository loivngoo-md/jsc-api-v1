import { forwardRef, Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Deposit from './entities/deposit.entity';
import { AppUserModule } from '../app-user/app-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit]),
    forwardRef(() => AppUserModule),
  ],
  controllers: [DepositController],
  providers: [DepositService],
  exports: [DepositService]
})
export class DepositModule { }

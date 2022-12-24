import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositAccountService } from './deposit-account.service';
import DepositAccount from './entities/deposit-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DepositAccount])],
  providers: [DepositAccountService],
  exports: [DepositAccountService],
})
export class DepositAccountModule {}

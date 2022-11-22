import { Module } from '@nestjs/common';
import { DepositAccountService } from './deposit-account.service';
import { DepositAccountController } from './deposit-account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import DepositAccount from './entities/deposit-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DepositAccount]),
  ],
  controllers: [DepositAccountController],
  providers: [DepositAccountService]
})
export class DepositAccountModule { }

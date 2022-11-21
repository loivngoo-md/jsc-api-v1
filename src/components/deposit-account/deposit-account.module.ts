import { Module } from '@nestjs/common';
import { DepositAccountService } from './deposit-account.service';
import { DepositAccountController } from './deposit-account.controller';

@Module({
  controllers: [DepositAccountController],
  providers: [DepositAccountService]
})
export class DepositAccountModule {}

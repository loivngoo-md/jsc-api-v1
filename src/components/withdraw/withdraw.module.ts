import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdraw } from './entities/withdraw.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Withdraw])],
  controllers: [WithdrawController],
  providers: [WithdrawService]
})
export class WithdrawModule {}

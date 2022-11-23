import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdraw } from './entities/withdraw.entity';
import { AppUserModule } from '../app-user/app-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Withdraw]), AppUserModule],
  controllers: [WithdrawController],
  providers: [WithdrawService],
})
export class WithdrawModule {}

import { forwardRef, Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdraw } from './entities/withdraw.entity';
import { AppUserModule } from '../../modules/app-user/app-user.module';
import { SystemConfigurationModule } from '../system-configuration/system-configuration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdraw]),
    forwardRef(() => AppUserModule),
    SystemConfigurationModule,
  ],
  controllers: [WithdrawController],
  providers: [WithdrawService],
  exports: [WithdrawService],
})
export class WithdrawModule {}

import { forwardRef, Module } from '@nestjs/common';
import { CmsUserService } from './cms-user.service';
import { CmsUserController } from './cms-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import CmsUser from './entities/cms-user.entity';
import { AppUserModule } from '../app-user/app-user.module';
import { MoneyLogModule } from '../../components/money-log/money-log.module';
import { OrderModule } from '../../components/order/order.module';
import { AuthModule } from '../../components/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CmsUser]),
    forwardRef(() => AppUserModule),
    MoneyLogModule,
    OrderModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [CmsUserController],
  providers: [CmsUserService],
  exports: [CmsUserService],
})
export class CmsUserModule {}

import { forwardRef, Module } from '@nestjs/common';
import { CmsUserService } from './cms-user.service';
import { CmsUserController } from './cms-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import CmsUser from './entities/cms-user.entity';
import { AppUserModule } from '../app-user/app-user.module';
import { MoneyLogModule } from '../money-log/money-log.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
     TypeOrmModule.forFeature([CmsUser]),
    AppUserModule,
    MoneyLogModule,
    forwardRef(() => AuthModule)
  ],
  controllers: [CmsUserController],
  providers: [CmsUserService],
  exports: [CmsUserService],
})
export class CmsUserModule { }

import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppUserModule } from '../../modules/app-user/app-user.module';
import { CmsUserModule } from '../../modules/cms-user/cms-user.module';
import { LoginRecordModule } from '../login-record/login-record.module';
import { AppStrategy } from './app-jwt.strategy';
import { AuthService } from './auth.service';
import { CmsStrategy } from './cms-jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    JwtModule.register({
      privateKey: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: '24h',
      },
    }),
    forwardRef(() => CmsUserModule),
    forwardRef(() => AppUserModule),
    LoginRecordModule,
  ],
  providers: [AuthService, CmsStrategy, AppStrategy],
  exports: [AuthService],
})
export class AuthModule {}

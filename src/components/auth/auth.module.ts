import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CmsStrategy } from './cms-jwt.strategy';
import { LoginRecordModule } from '../login-record/login-record.module';
import { CmsUserModule } from '../cms-user/cms-user.module';
import { AppUserModule } from '../app-user/app-user.module';
import { AppStrategy } from './app-jwt.strategy';

@Module({
  imports: [
    AppUserModule,
    CmsUserModule,
    LoginRecordModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    JwtModule.register({
      privateKey: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
  providers: [AuthService, CmsStrategy, AppStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CmsStrategy } from './cms-jwt.strategy';
import { LoginRecordModule } from '../login-record/login-record.module';
import { AppStrategy } from './app-jwt.strategy';
import { AppUserModule } from '../../modules/app-user/app-user.module';
import { CmsUserModule } from '../../modules/cms-user/cms-user.module';

@Module({
  imports: [
    AppUserModule,
    forwardRef(() => CmsUserModule),
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
export class AuthModule { }

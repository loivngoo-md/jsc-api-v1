import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CmsUserModule } from './components/cms-user/cms-user.module';
import { AppUserModule } from './components/app-user/app-user.module';
import * as Joi from '@hapi/joi';
import { AuthModule } from './components/auth/auth.module';
import { LoginRecordModule } from './components/login-record/login-record.module';
import { MoneyLogModule } from './components/money-log/money-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
      }),
      isGlobal: true
    },
    ),
    DatabaseModule,
    CmsUserModule,
    AppUserModule,
    AuthModule,
    LoginRecordModule,
    MoneyLogModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

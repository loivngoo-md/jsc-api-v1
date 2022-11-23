import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CmsUserModule } from './components/cms-user/cms-user.module';
import { AppUserModule } from './components/app-user/app-user.module';
import * as Joi from '@hapi/joi';
import { AuthModule } from './components/auth/auth.module';
import { LoginRecordModule } from './components/login-record/login-record.module';
import { MoneyLogModule } from './components/money-log/money-log.module';
import { DepositModule } from './components/deposit/deposit.module';
import { WithdrawModule } from './components/withdraw/withdraw.module';
import { DepositAccountModule } from './components/deposit-account/deposit-account.module';
import { StockModule } from './components/stock/stock.module';
import {HttpModule} from '@nestjs/axios'
import { OrderModule } from './components/order/order.module';

@Module({
  imports: [
    HttpModule,
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
    DepositModule,
    WithdrawModule,
    DepositAccountModule,
    StockModule,
    OrderModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

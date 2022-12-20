import * as Joi from '@hapi/joi';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SystemConfigurationModule } from './components/system-configuration/system-configuration.module';
import { DatabaseModule } from './database/database.module';
import { AppUserModule } from './modules/app-user/app-user.module';
import { CmsUserModule } from './modules/cms-user/cms-user.module';

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
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    DatabaseModule,
    CmsUserModule,
    AppUserModule,
    SystemConfigurationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

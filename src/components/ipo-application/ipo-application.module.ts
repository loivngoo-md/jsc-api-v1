import { AppUserModule } from '../../modules/app-user/app-user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpoApplication } from './entities/ipo-application.entity';
import { IpoApplicationService } from './ipo-application.service';
import { IpoStockService } from '../ipo-stock/ipo-stock.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([IpoApplication]),
    AppUserModule,
    IpoStockService,
  ],
  providers: [IpoApplicationService],
  exports: [IpoApplicationService],
})
export class IpoApplicationModule {}

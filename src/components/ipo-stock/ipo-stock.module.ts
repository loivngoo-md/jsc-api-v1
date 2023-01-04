import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpoStock } from './entities/ipo-stock.entity';
import { IpoStockService } from './ipo-stock.service';

@Module({
  imports: [TypeOrmModule.forFeature([IpoStock])],
  providers: [IpoStockService],
  exports: [IpoStockService],
})
export class IpoStockModule {}

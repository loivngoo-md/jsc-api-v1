import { Module } from '@nestjs/common';
import { FavoriteStockService } from './favorite-stock.service';
import { StockModule } from 'src/components/stock/stock.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteStock } from './entities/favorite-stock.entity';

@Module({
  imports: [StockModule, TypeOrmModule.forFeature([FavoriteStock])],
  providers: [FavoriteStockService],
  exports: [FavoriteStockService],
})
export class FavoriteStockModule {}

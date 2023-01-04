import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockModule } from '../stock/stock.module';
import { BlockTransactionsService } from './block-transactions.service';
import { BlockTransaction } from './entities/block-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockTransaction]), StockModule],
  providers: [BlockTransactionsService],
  exports: [BlockTransactionsService],
})
export class BlockTransactionsModule {}

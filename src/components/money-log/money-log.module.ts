import { Module } from '@nestjs/common';
import { MoneyLogService } from './money-log.service';
import MoneyLog from './entities/money-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MoneyLog])],
  providers: [MoneyLogService],
  exports: [MoneyLogService],
})
export class MoneyLogModule {}

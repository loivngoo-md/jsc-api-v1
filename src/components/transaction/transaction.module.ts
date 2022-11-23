import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUserModule } from '../app-user/app-user.module';
import Transaction from './entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), AppUserModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}

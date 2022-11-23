import { Module } from '@nestjs/common';
import { LoginRecordService } from './login-record.service';
import { LoginRecordController } from './login-record.controller';
import LoginRecord from './entities/login-record.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LoginRecord])],
  controllers: [LoginRecordController],
  providers: [LoginRecordService],
  exports: [LoginRecordService],
})
export class LoginRecordModule {}

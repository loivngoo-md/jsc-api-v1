import { Module } from '@nestjs/common';
import { LoginRecordService } from './login-record.service';
import LoginRecord from './entities/login-record.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LoginRecord])],
  providers: [LoginRecordService],
  exports: [LoginRecordService],
})
export class LoginRecordModule {}

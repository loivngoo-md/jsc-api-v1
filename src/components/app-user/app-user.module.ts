import { Module } from '@nestjs/common';
import { AppUserService } from './app-user.service';
import { AppUserController } from './app-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppUser from './entities/app-user.entity';
import { LocalFileModule } from '../local-file/local-file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppUser]),
    LocalFileModule
  ],
  controllers: [AppUserController],
  providers: [AppUserService],
  exports: [AppUserService],
})
export class AppUserModule {}

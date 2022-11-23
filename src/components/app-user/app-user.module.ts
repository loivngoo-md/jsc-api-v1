import { Module } from '@nestjs/common';
import { AppUserService } from './app-user.service';
import { AppUserController } from './app-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppUser from './entities/app-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppUser])],
  controllers: [AppUserController],
  providers: [AppUserService],
  exports: [AppUserService],
})
export class AppUserModule {}

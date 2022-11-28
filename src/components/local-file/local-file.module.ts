import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import LocalFile from './entities/local-file.entity';
import { LocalFileController } from './local-file.controller';
import { LocalFilesService } from './local-file.service';

@Module({
  imports: [TypeOrmModule.forFeature([LocalFile])],
  controllers: [LocalFileController],
  providers: [LocalFilesService],
  exports: [LocalFilesService]
})
export class LocalFileModule {}

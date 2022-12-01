import { Module } from '@nestjs/common';
import { SystemConfigurationService } from './system-configuration.service';
import { SystemConfigurationController } from './system-configuration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfiguration } from './entities/system-configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfiguration])],
  controllers: [SystemConfigurationController],
  providers: [SystemConfigurationService],
  exports: [SystemConfigurationService]
})
export class SystemConfigurationModule { }

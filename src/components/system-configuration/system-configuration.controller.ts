import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SystemConfigurationService } from './system-configuration.service';
import { CreateSystemConfigurationDto } from './dto/create-system-configuration.dto';
import { UpdateSystemConfigurationDto } from './dto/update-system-configuration.dto';

@Controller('system-configuration')
export class SystemConfigurationController {
  constructor(
    private readonly systemConfigurationService: SystemConfigurationService,
  ) {}

  @Post()
  create(@Body() createSystemConfigurationDto: CreateSystemConfigurationDto) {
    return this.systemConfigurationService.create(createSystemConfigurationDto);
  }

  @Get()
  findOne() {
    return this.systemConfigurationService.findOne();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSystemConfigurationDto: UpdateSystemConfigurationDto,
  ) {
    return this.systemConfigurationService.update(
      +id,
      updateSystemConfigurationDto,
    );
  }
}

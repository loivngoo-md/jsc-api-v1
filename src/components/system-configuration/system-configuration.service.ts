import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSystemConfigurationDto } from './dto/create-system-configuration.dto';
import { UpdateSystemConfigurationDto } from './dto/update-system-configuration.dto';
import { SystemConfiguration } from './entities/system-configuration.entity';

@Injectable()
export class SystemConfigurationService {
  constructor(
    @InjectRepository(SystemConfiguration)
    private readonly _systemConfiguration: Repository<SystemConfiguration>,
  ) {}

  async create(dto: CreateSystemConfigurationDto) {
    const transaction = this._systemConfiguration.create(dto);
    await this._systemConfiguration.save(transaction);
    return transaction;
  }

  findOne() {
    return this._systemConfiguration.findOne({
      where: { is_main_config: true },
    });
  }

  async update(
    id: number,
    updateSystemConfigurationDto: UpdateSystemConfigurationDto,
  ) {
    await this._systemConfiguration.update(
      { id: id },
      updateSystemConfigurationDto,
    );
    return `This action updates a #${id} systemConfiguration`;
  }

  remove(id: number) {
    return `This action removes a #${id} systemConfiguration`;
  }
}

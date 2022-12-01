import { Injectable } from '@nestjs/common';
import { CreateSystemConfigurationDto } from './dto/create-system-configuration.dto';
import { UpdateSystemConfigurationDto } from './dto/update-system-configuration.dto';
import { SystemConfiguration } from './entities/system-configuration.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SystemConfigurationService {

  constructor(
    @InjectRepository(SystemConfiguration)
    private readonly _systemConfiguration: Repository<SystemConfiguration>
  ) { }

  async create(dto: CreateSystemConfigurationDto) {
    const transaction = this._systemConfiguration.create(dto)
    await this._systemConfiguration.save(transaction)
    return transaction
  }

  findAll() {
    return this._systemConfiguration.find()
  }

  findOne() {
    return this._systemConfiguration.find({ where: { is_main_config: true } })
  }

  update(id: number, updateSystemConfigurationDto: UpdateSystemConfigurationDto) {
    return `This action updates a #${id} systemConfiguration`;
  }

  remove(id: number) {
    return `This action removes a #${id} systemConfiguration`;
  }
}

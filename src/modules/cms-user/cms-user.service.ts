import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateCmsUserDto } from './dto/create-cms-user.dto';
import { UpdateCmsUserDto } from './dto/update-cms-user.dto';
import CmsUser from './entities/cms-user.entity';

@Injectable()
export class CmsUserService {
  constructor(
    @InjectRepository(CmsUser)
    private _cmsUserRepo: Repository<CmsUser>,
  ) {}

  async create(createCmsUserDto: CreateCmsUserDto) {
    const newUser = await this._cmsUserRepo.create(createCmsUserDto);
    await this._cmsUserRepo.save(newUser);
    return newUser;
  }

  async findByUsername(username: string) {
    const user = await this._cmsUserRepo.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('Not found cms user');
    }
    return user;
  }

  findAll() {
    return this._cmsUserRepo.find();
  }

  async findOne(id: number) {
    const user = await this._cmsUserRepo.findOne({ where: { id: id } });
    if (user) {
      return user;
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, updateCmsUserDto: UpdateCmsUserDto) {
    await this._cmsUserRepo.update(id, updateCmsUserDto);
    const updatedUser = await this._cmsUserRepo.findOne({ where: { id: id } });
    if (updatedUser) {
      return updatedUser;
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async remove(id: number) {
    const deleteResponse = await this._cmsUserRepo.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async updatePassword(id: number, dto: any) {
    const user = await this._cmsUserRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('Not found user.');
    }

    const compare = await bcrypt.compare(
      dto['old_password'],
      user['withdraw_password'],
    );
    if (!compare) {
      throw new BadRequestException('Wrong old password');
    }

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(dto['new_password'], salt);

    return this._cmsUserRepo.update(id, { password });
  }
}

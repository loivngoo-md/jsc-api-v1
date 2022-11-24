import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCmsUserDto } from './dto/create-cms-user.dto';
import { UpdateCmsUserDto } from './dto/update-cms-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CmsUser from './entities/cms-user.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class CmsUserService {
  constructor(
    @InjectRepository(CmsUser)
    private _cmsUserRepo: Repository<CmsUser>,

  ) { }

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
}

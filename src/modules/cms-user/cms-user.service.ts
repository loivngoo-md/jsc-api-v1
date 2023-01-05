import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { MESSAGE, USER_MESSAGE } from '../../common/constant';
import { UpdatePassword } from '../../helpers/dto-helper';
import { CmsUserListQuery } from './dto/cms-user-query.dto';
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
    const { username, password, phone, real_name, is_active } =
      createCmsUserDto;

    const existUser = await this._cmsUserRepo.findOne({ where: { username } });
    if (existUser) {
      throw new BadRequestException(
        MESSAGE.isExistError('Cms User', 'with this Username'),
      );
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCms = this._cmsUserRepo.create({
      username,
      password: hashedPassword,
      real_name,
      phone,
      is_active,
    });

    await this._cmsUserRepo.save(newCms);
    return newCms;
  }

  async findByUsername(username: string, findInLogin?: boolean) {
    const user = await this._cmsUserRepo.findOne({ where: { username } });
    if (!user && !findInLogin) {
      throw new NotFoundException(MESSAGE.notFoundError('Cms User'));
    }
    return user;
  }

  async findAll(query: CmsUserListQuery) {
    const { username, phone, real_name, page, pageSize } = query;
    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    const whereConditions = {};

    username && Object.assign(whereConditions, { username });
    phone && Object.assign(whereConditions, { phone });
    real_name && Object.assign(whereConditions, { real_name });

    const total = await this._cmsUserRepo.countBy(whereConditions);
    const recs = await this._cmsUserRepo.find({
      where: whereConditions,
      take,
      skip,
    });

    return {
      count: recs.length,
      data: recs,
      total,
    };
  }

  async findOne(id: number) {
    const user = await this._cmsUserRepo.findOne({ where: { id: id } });
    if (user) {
      return user;
    }
    throw new NotFoundException(MESSAGE.notFoundError('Cms User'));
  }

  async update(id: number, updateCmsUserDto: UpdateCmsUserDto) {
    delete updateCmsUserDto['password'];
    await this._cmsUserRepo.update(id, updateCmsUserDto);
    const updatedUser = await this._cmsUserRepo.findOne({ where: { id: id } });
    if (updatedUser) {
      return updatedUser;
    }
    throw new NotFoundException(MESSAGE.notFoundError('Cms User'));
  }

  async remove(id: number) {
    const deleteResponse = await this._cmsUserRepo.delete(id);
    if (!deleteResponse.affected) {
      throw new NotFoundException(MESSAGE.notFoundError('Cms User'));
    }
  }

  async updatePassword(id: number, dto: UpdatePassword) {
    const { old_password, new_password } = dto;
    const user = await this._cmsUserRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(MESSAGE.notFoundError('Cms User'));
    }
    const { password } = user;
    const compare = await bcrypt.compare(old_password, password);

    if (!compare) {
      throw new BadRequestException(USER_MESSAGE.WRONG_OLD_PASSWORD);
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(new_password, salt);
    await this._cmsUserRepo.save(user);

    return { isSuccess: true };
  }

  async actionLockOnCms(id: number, isLock?: boolean) {
    const cmsUser = await this.findOne(id);

    cmsUser.is_active = !isLock;
    await this._cmsUserRepo.save(cmsUser);

    return { isSuccess: true };
  }
}

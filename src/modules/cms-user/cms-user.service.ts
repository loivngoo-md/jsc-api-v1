import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { ILike, Repository } from 'typeorm';
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
        MESSAGE.isExistError('用户', 'with this Username'),
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

  async findByUsername(username: string, isPartService?: boolean) {
    const user = await this._cmsUserRepo.findOne({ where: { username } });
    if (!user && !isPartService) {
      throw new NotFoundException(MESSAGE.notFoundError('用户'));
    }
    return user;
  }

  async findAll(query: CmsUserListQuery) {
    const { username, phone, real_name, page, pageSize } = query;
    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    const whereConditions = {};

    username &&
      Object.assign(whereConditions, { username: ILike(`%${username}%`) });
    phone && Object.assign(whereConditions, { phone: ILike(`%${phone}%`) });
    real_name &&
      Object.assign(whereConditions, { real_name: ILike(`%${real_name}%`) });

    const total = await this._cmsUserRepo.countBy(whereConditions);
    const recs = await this._cmsUserRepo.find({
      where: whereConditions,
      take,
      skip,
      order: {
        created_at: "DESC"
      }
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
    throw new NotFoundException(MESSAGE.notFoundError('用户'));
  }

  async update(id: number, updateCmsUserDto: UpdateCmsUserDto) {
    delete updateCmsUserDto['password'];
    await this._cmsUserRepo.update(id, updateCmsUserDto);
    const updatedUser = await this._cmsUserRepo.findOne({ where: { id: id } });
    if (updatedUser) {
      return updatedUser;
    }
    throw new NotFoundException(MESSAGE.notFoundError('用户'));
  }

  async remove(id: number) {
    const deleteResponse = await this._cmsUserRepo.delete(id);
    if (!deleteResponse.affected) {
      throw new NotFoundException(MESSAGE.notFoundError('用户'));
    }
  }

  async updatePassword(id: number, dto: UpdatePassword) {
    const { old_password, new_password } = dto;
    const user = await this._cmsUserRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(MESSAGE.notFoundError('用户'));
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

  async getDashboard() {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    console.log(start.getTime(), end.getTime());

    const dashboardQuery = `
   SELECT
	  ( SELECT COUNT ( * ) :: INTEGER FROM app_users WHERE is_real = TRUE AND is_delete = FALSE ) AS real_user,
	  ( SELECT COUNT ( * ) :: INTEGER FROM app_users WHERE is_real = FALSE AND is_delete = FALSE ) AS virtual_user,
	  ( SELECT COUNT ( * ) :: INTEGER FROM app_users WHERE is_delete = FALSE ) AS total_user,
	  ( SELECT COALESCE ( SUM ( amount ), 0 ) FROM deposit WHERE status = 1 ) AS total_deposits,
	  ( SELECT COALESCE ( SUM ( amount ), 0 ) FROM withdraw WHERE status = 1 ) AS total_withdrawal,
	  ( SELECT COALESCE ( SUM ( amount ), 0 ) FROM deposit WHERE status = 1 AND created_at BETWEEN ${start.getTime()} AND ${end.getTime()} ) AS today_deposits,
	  ( SELECT COALESCE ( SUM ( amount ), 0 ) FROM withdraw WHERE status = 1 AND created_at BETWEEN ${start.getTime()} AND ${end.getTime()} ) AS today_withdrawal,
	  ( SELECT SUM ( balance ) FROM app_users WHERE is_delete = FALSE ) AS total_balance,
	  ( SELECT SUM ( balance_avail ) FROM app_users WHERE is_delete = FALSE ) AS total_balance_vail,
	  ( SELECT COUNT ( * ) :: INTEGER FROM "stock-storage" WHERE status = 1 ) AS total_open_positions,
	  ( SELECT COUNT ( * ) :: INTEGER FROM "stock-storage" WHERE status = 0 ) AS total_closed_positions,
	  ( SELECT COUNT ( * ) :: INTEGER FROM "ipo-stock" WHERE is_delete = FALSE AND is_on_market = FALSE ) AS total_new_share,
	  ARRAY( SELECT row_to_json(orders.*) as order_detail FROM "orders" ORDER BY created_at DESC LIMIT 5 ) AS dynamic_positions`;

    const dashboardRec = await this._cmsUserRepo.query(dashboardQuery);
    return { data: dashboardRec[0] };
  }
}

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import AppUser from './entities/app-user.entity';
import { LocalFileDto } from '../local-file/dto/local-file.dto';
import { LocalFilesService } from '../local-file/local-file.service';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class AppUserService {
  constructor(
    @InjectRepository(AppUser)
    private _appUserRepo: Repository<AppUser>,
    private localFilesService: LocalFilesService,
  ) { }

  async update_customer_profit(id: number) {



  }
  async update_customer_hold_value(id: number) {

  }
  async update_customer_balance_frozen(id: number) {

  }
  async update_customer_balance_avail(id: number) {

  }
  async freeze_account(id: number) {
    let { is_freeze } = await this._appUserRepo.findOne({ where: { id } })
    if (is_freeze === true) {
      is_freeze = false
    } else {
      is_freeze = true
    }

  }

  async addFrontBackCCCD(user_id: number, fileData: LocalFileDto, dto: {
    type: number
  }) {

    if (dto['type'] === 1) {
      await this._appUserRepo.update(user_id, { id_front_cccd: fileData.filename })

    } else if (dto['type'] === 0) {
      await this._appUserRepo.update(user_id, { id_back_cccd: fileData.filename })
    }

    return fileData.filename
  }

  async modifiedBalance(
    id: number,
    body: {
      amount: number;
      type: number;
      comments: string;
      remark: string;
    },
  ) {
    const { type, amount, comments, remark } = body;
    const { balance } = await this._appUserRepo.findOne({ where: { id } });

    const newBalance = !!type
      ? Number(balance) + amount
      : Number(balance) - amount;
    await this.update(id, { balance: newBalance });

    return {
      user_id: id,
      amount: amount,
      before: balance,
      after: newBalance,
      type,
      comments,
      remark,
    };
  }

  async verifiedAccount(id: number) {
    const user = await this._appUserRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User is not found.');
    }
    return await this._appUserRepo.update(id, { is_verified: true })
  }

  async create(createAppUserDto: CreateAppUserDto) {
    const isExistedUser = await this._appUserRepo.findOne({
      where: { username: createAppUserDto['username'] },
    });
    if (!!isExistedUser) {
      throw new BadRequestException('Username is existed.');
    }

    const newUser = await this._appUserRepo.create(createAppUserDto);
    await this._appUserRepo.save(newUser);
    return newUser;
  }

  async findByUsername(username: string) {
    const user = await this._appUserRepo.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('Not found app user.');
    }
    return user;
  }

  async findAll() {
    return this._appUserRepo.find();
  }

  async getAppUserWithPagging(query: {
    page: number;
    limit: number;
    search?: string;
  }) {
    let app_users: any[];

    const { page, limit } = query;
    const take = +limit;
    const skip = +limit * (+page - 1);

    if (query.search) {
      app_users = await this._appUserRepo.find({
        where: {
          is_active: true,
          username: `%${query.search}%`
        },
        take,
        skip,
      });
    }

    app_users = await this._appUserRepo.find({
      where: {
        is_active: true
      },
      take,
      skip,
    });

    app_users.map((user) => {
      user.balance = parseFloat(user.balance);
      user.balance_frozen = parseFloat(user.balance_frozen);
      user.balance_avail = parseFloat(user.balance_avail);
      user.total_assets = parseFloat(user.total_assets);
      user.withdraw_avail = parseFloat(user.withdraw_avail);
      user.profit = parseFloat(user.profit);
      user.balance_avail_newshare = parseFloat(user.balance_avail_newshare);
      user.sell_amount_day = parseInt(user.sell_amount_day);
      user.hold_value = parseFloat(user.hold_value);

      return {
        ...user,
      };
    });

    return {
      count: app_users.length,
      data: app_users,
    };
  }

  async findOne(id: number) {
    const user = await this._appUserRepo.findOne({ where: { id: id } });
    if (user) {
      return user;
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, dto: UpdateAppUserDto) {
    const user = await this._appUserRepo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('Not found user.');
    }
    if (dto['withdraw_password']) {
      const salt = await bcrypt.genSalt();
      dto['withdraw_password'] = await bcrypt.hash(dto['withdraw_password'], salt);
    }

    await this._appUserRepo.update(id, dto);
    const updatedUser = await this._appUserRepo.findOne({ where: { id: id } });
    if (updatedUser) {
      return updatedUser;
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async remove(id: number) {
    const deleteResponse = await this._appUserRepo.delete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }
}

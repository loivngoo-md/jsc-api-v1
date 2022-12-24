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
import { MoneyLogService } from '../../components/money-log/money-log.service';
import { UpdateAppUserDto } from './dto/update-app-user.dto';
import AppUser from './entities/app-user.entity';

@Injectable()
export class AppUserService {
  constructor(
    @InjectRepository(AppUser)
    private _appUserRepo: Repository<AppUser>,
    private _moneyLogService: MoneyLogService,
  ) {}

  async setPassword(id: number, pw: string) {
    const user = await this._appUserRepo.findOneByOrFail({ id });
    if (user) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash(pw, salt);
      return await this._appUserRepo.update(id, { password });
    }

    throw new NotFoundException('Not Found User');
  }

  async setWithdrawalPassword(id: number, pw: string) {
    const user = await this._appUserRepo.findOneByOrFail({ id });
    if (user) {
      const salt = await bcrypt.genSalt();
      const withdraw_password = await bcrypt.hash(pw, salt);
      return await this._appUserRepo.update(id, { withdraw_password });
    }

    throw new NotFoundException('Not Found User');
  }

  async update_customer_profit(id: number) {}
  async update_customer_hold_value(id: number) {}

  async get_customer_balance_frozen(id: number) {
    const user = await this._appUserRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User is not found.');
    }

    return {
      amount: user['balance_frozen'],
    };
  }
  async update_customer_balance_avail(id: number) {}
  async freeze_account(id: number) {
    let { is_freeze } = await this._appUserRepo.findOne({ where: { id } });
    if (is_freeze === true) {
      is_freeze = false;
    } else {
      is_freeze = true;
    }
  }

  async addFrontBackCCCD(
    user_id: number,
    fileData: any,
    dto: {
      type: number;
    },
  ) {
    if (dto['type'] === 1) {
      await this._appUserRepo.update(user_id, {
        id_front: fileData.filename,
      });
    } else if (dto['type'] === 0) {
      await this._appUserRepo.update(user_id, {
        id_back: fileData.filename,
      });
    }

    return fileData.filename;
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
    const { balance, balance_avail } = await this._appUserRepo.findOne({
      where: { id },
    });

    const newBalance = !!type
      ? Number(balance) + amount
      : Number(balance) - amount;
    const newBalanceAvail = !!type
      ? Number(balance_avail) + amount
      : Number(balance_avail) - amount;
    await Promise.all([
      this.update(id, { balance: newBalance, balance_avail: newBalanceAvail }),
      this._moneyLogService.insert({
        user_id: id,
        amount,
        before: balance,
        after: newBalance,
        type: type,
        comments,
        remark,
      }),
    ]);

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
    return await this._appUserRepo.update(id, { is_verified: true });
  }

  async create(createAppUserDto: any) {
    const isExistedUser = await this._appUserRepo.findOne({
      where: { username: createAppUserDto['username'] },
    });
    if (!!isExistedUser) {
      throw new BadRequestException('Username is existed.');
    }
    const salt = await bcrypt.genSalt();
    createAppUserDto['password'] = await bcrypt.hash(
      createAppUserDto['password'],
      salt,
    );

    const newUser = this._appUserRepo.create(createAppUserDto);
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
    pageSize: number;
    search?: string;
  }) {
    let app_users: any[];

    const { page, pageSize } = query;
    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    if (query.search) {
      app_users = await this._appUserRepo.find({
        where: {
          is_active: true,
          username: `%${query.search}%`,
        },
        take,
        skip,
      });
    }

    app_users = await this._appUserRepo.find({
      where: {
        is_active: true,
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
      dto['withdraw_password'] = await bcrypt.hash(
        dto['withdraw_password'],
        salt,
      );
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

  async updatePassword(id: number, dto: any) {
    const user = await this._appUserRepo.findOne({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('Not found user.');
    }
    const compare = await bcrypt.compare(dto['old_password'], user['password']);
    if (!compare) {
      throw new BadRequestException('Wrong old password');
    }

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(dto['new_password'], salt);

    return await this._appUserRepo.update(id, { password });
  }

  async updateWithdrawalPassword(id: number, dto: any) {
    const user = await this._appUserRepo.findOne({ where: { id } });
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
    const withdraw_password = await bcrypt.hash(dto['new_password'], salt);

    return this._appUserRepo.update(id, { withdraw_password });
  }
}

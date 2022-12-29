import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Like, Repository } from 'typeorm';
import { ACCOUNT_TYPE, IMAGE_TYPE, MODIFY_TYPE } from '../../common/enums';
import { PayLoad } from '../../components/auth/dto/PayLoad';
import { MoneyLogCreate } from '../../components/money-log/dto/money-log-create.dto';
import { MoneyLogService } from '../../components/money-log/money-log.service';
import { SetPassword, UpdatePassword } from '../../helpers/dto-helper';
import { AgentService } from './../../components/agent/agent.service';
import { AppUserListQuery } from './dto/app-user-query.dto';
import { AppUserCreate, AppUserRegister } from './dto/create-app-user.dto';
import {
  AppUserUpdateBalance,
  AppUserUpdateDetail,
} from './dto/update-app-user.dto';
import AppUser from './entities/app-user.entity';

@Injectable()
export class AppUserService {
  constructor(
    @InjectRepository(AppUser)
    private _appUserRepo: Repository<AppUser>,
    private _moneyLogService: MoneyLogService,
    private _agentService: AgentService,
  ) {}

  async update_customer_profit(id: number) {}
  async update_customer_hold_value(id: number) {}
  async update_customer_balance_avail(id: number) {}

  async get_customer_balance_frozen(user_id: number) {
    const user = await this.findOne(user_id);
    if (!user) {
      throw new NotFoundException('User is not found.');
    }

    return {
      amount: user['balance_frozen'],
    };
  }

  // async freeze_account(id: number) {
  //   let { is_freeze } = await this._appUserRepo.findOne({ where: { id } });
  //   if (is_freeze === true) {
  //     is_freeze = false;
  //   } else {
  //     is_freeze = true;
  //   }
  // }

  async addFrontBackCCCD(
    user_id: number,
    fileData: any,
    dto: {
      type: number;
    },
  ) {
    const appUser = await this.findOne(user_id);
    if (dto['type'] === IMAGE_TYPE.FRONT) {
      appUser.id_front = fileData.filename;
    }
    if (dto['type'] === IMAGE_TYPE.BACK) {
      appUser.id_back = fileData.filename;
    }

    await this._appUserRepo.save(appUser);
    return fileData.filename;
  }

  async modifiedBalance(user_id: number, body: MoneyLogCreate) {
    const { type, amount, comments, remark } = body;
    const appUser = await this.findOne(user_id);
    const { balance, balance_avail } = appUser;

    const newBalance =
      type === MODIFY_TYPE.INCREASE
        ? Number(balance) + amount
        : Number(balance) - amount;
    const newBalanceAvail =
      type === MODIFY_TYPE.INCREASE
        ? Number(balance_avail) + amount
        : Number(balance_avail) - amount;

    appUser.balance = newBalance;
    appUser.balance_avail = newBalanceAvail;

    const moneyLogInfo = {
      user_id: user_id,
      amount,
      before: balance,
      after: newBalance,
      type: type,
      user_type: ACCOUNT_TYPE.APP,
      comments,
      remark,
    };

    await Promise.all([
      this._appUserRepo.save(appUser),
      this._moneyLogService.insert(moneyLogInfo),
    ]);

    return moneyLogInfo;
  }

  async verifiedAccount(user_id: number) {
    const appUser = await this.findOne(user_id);
    appUser.is_verified = true;
    await this._appUserRepo.save(appUser);

    return { isSuccess: true };
  }

  async register(body: AppUserRegister, isPartService?: boolean) {
    const { username, password, agent_code } = body;

    const [isExistedUser, existAgent] = await Promise.all([
      this.findByUsername(username, true),
      this._agentService.findByCode(agent_code),
    ]);

    if (isExistedUser) {
      throw new BadRequestException('Username is existed.');
    }

    if (!existAgent) {
      throw new NotFoundException('Agent Code is not found.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this._appUserRepo.create({
      username,
      password: hashedPassword,
      agent: existAgent.id,
      superior: existAgent.username,
    });

    !isPartService && (await this._appUserRepo.save(newUser));
    return newUser;
  }

  async create(body: AppUserCreate, cms_user: PayLoad) {
    const { username, password, agent_code, is_real, amount } = body;

    const newUser = await this.register(
      { username, password, agent_code },
      true,
    );

    newUser.is_real = is_real;
    newUser.balance = amount;
    newUser.balance_avail = amount;
    newUser.created_by = cms_user.username;

    await this._appUserRepo.save(newUser);
    return newUser;
  }

  async findByUsername(username: string, isPartService?: boolean) {
    const user = await this._appUserRepo.findOne({
      where: { username, is_delete: false },
    });
    if (!user && !isPartService) {
      throw new NotFoundException('Not found app user.');
    }
    return user;
  }

  async getList(query: AppUserListQuery) {
    const { page, pageSize, agent, is_real, real_name, phone } = query;
    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;
    const whereConditions: Object = { is_real: true, is_delete: false };

    agent && Object.assign(whereConditions, { agent });
    real_name &&
      Object.assign(whereConditions, { real_name: Like(`%${real_name}%`) });
    phone && Object.assign(whereConditions, { phone: Like(`%${phone}%`) });
    is_real && Object.assign(whereConditions, { is_real });

    const app_users = await this._appUserRepo.find({
      where: whereConditions,
      take,
      skip,
    });

    return {
      count: app_users.length,
      data: app_users,
    };
  }

  async getListByAgent(query: AppUserListQuery, agent_id: number) {
    const { page, pageSize, agent, is_real, real_name, phone } = query;
    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    const agentUser = await this._agentService.findOne(agent_id);

    const queryBuilder = this._appUserRepo
      .createQueryBuilder('u')
      .innerJoinAndSelect('agent', 'a', 'a.id = u.agent')
      .select(['u.*']);

    queryBuilder.where(`a.path like '${agentUser.path}%'`);
    is_real && queryBuilder.andWhere(`u.is_real = ${is_real}`);
    real_name && queryBuilder.andWhere(`u.username like '%${real_name}%'`);
    phone && queryBuilder.andWhere(`u.phone like '%${phone}%'`);
    if (agent) {
      const queryAgent = await this._agentService.findOne(agent);
      queryBuilder.andWhere(`a.path like '${queryAgent.path}%'`);
    }

    const total = await queryBuilder.clone().getCount();
    const app_users = await queryBuilder.limit(take).offset(skip).getRawMany();

    return {
      count: app_users.length,
      data: app_users,
      total,
    };
  }

  async findOne(id: number) {
    const user = await this._appUserRepo.findOne({
      where: { id, is_delete: false },
    });
    if (user) {
      return user;
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  // async update(id: number, dto: any) {
  //   const user = await this._appUserRepo.findOne({
  //     where: { id, is_delete: false },
  //   });

  //   if (!user) {
  //     throw new BadRequestException('Not found user.');
  //   }

  //   delete dto['password'];
  //   delete dto['withdraw_password'];

  //   await this._appUserRepo.update(id, dto);
  //   const updatedUser = await this._appUserRepo.findOne({ where: { id: id } });
  //   if (updatedUser) {
  //     return updatedUser;
  //   }
  //   throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  // }

  async updateProfile(user_id: number, body: any) {}

  async updateAppUser(user_id: number, body: AppUserUpdateDetail) {
    const user = await this.findOne(user_id);
    const { agent_code, phone, real_name, is_active, is_freeze } = body;

    const agent = await this._agentService.findByCode(agent_code);
    agent && Object.assign(user, { agent: agent.id, superior: agent.username });
    phone && Object.assign(user, { phone });
    real_name && Object.assign(user, { real_name });
    is_active && Object.assign(user, { is_active });
    is_freeze && Object.assign(user, { is_freeze });

    await this._appUserRepo.save(user);
    return { isSuccess: true };
  }

  async updateBalance(user_id: number, body: AppUserUpdateBalance) {
    const appUser = await this.findOne(user_id);
    const { balance, balance_avail, balance_frozen } = body;
    balance && (appUser.balance = balance);
    balance_avail && (appUser.balance_avail = balance_avail);
    balance_frozen && (appUser.balance_frozen = balance_frozen);
    await this._appUserRepo.save(appUser);

    return { isSuccess: true };
  }

  async remove(user_id: number) {
    const appUser = await this.findOne(user_id);
    appUser.is_delete = true;
    await this._appUserRepo.save(appUser);

    return { isSuccess: true };
  }

  async updatePassword(user_id: number, dto: UpdatePassword) {
    const { old_password, new_password } = dto;
    const appUser = await this.findOne(user_id);

    const compare = await bcrypt.compare(old_password, appUser.password);
    if (!compare) {
      throw new BadRequestException('Wrong old password');
    }

    const salt = await bcrypt.genSalt();
    appUser.password = await bcrypt.hash(new_password, salt);

    await this._appUserRepo.save(appUser);
    return { isSuccess: true };
  }

  async updateWithdrawalPassword(user_id: number, dto: UpdatePassword) {
    const { old_password, new_password } = dto;
    const appUser = await this.findOne(user_id);

    let { withdraw_password } = appUser;
    if (withdraw_password) {
      if (!old_password) {
        throw new BadRequestException('Old password is required');
      }

      const compare = await bcrypt.compare(old_password, withdraw_password);

      if (!compare) {
        throw new BadRequestException('Wrong old password');
      }
    }

    const salt = await bcrypt.genSalt();
    appUser.withdraw_password = await bcrypt.hash(new_password, salt);

    await this._appUserRepo.save(appUser);
    return { isSuccess: true };
  }

  async setPassword(user_id: number, body: SetPassword) {
    const { password } = body;
    const appUser = await this.findOne(user_id);

    const salt = await bcrypt.genSalt();
    appUser.password = await bcrypt.hash(password, salt);

    await this._appUserRepo.save(appUser);
    return { isSuccess: true };
  }

  async setWithdrawalPassword(user_id: number, body: SetPassword) {
    const { password } = body;
    const appUser = await this.findOne(user_id);

    const salt = await bcrypt.genSalt();
    appUser.withdraw_password = await bcrypt.hash(password, salt);

    await this._appUserRepo.save(appUser);
    return { isSuccess: true };
  }
}

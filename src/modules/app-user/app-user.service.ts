import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Like, Repository } from 'typeorm';
import { ACCOUNT_TYPE, IMAGE_TYPE, MODIFY_TYPE } from '../../common/enums';
import { PayLoad } from '../../components/auth/dto/PayLoad';
import { MoneyLogCreate } from '../../components/money-log/dto/money-log-create.dto';
import { MoneyLogService } from '../../components/money-log/money-log.service';
import { SetPassword, UpdatePassword } from '../../helpers/dto-helper';
import { AgentService } from '../agent/agent.service';
import { MESSAGE, USER_MESSAGE } from './../../common/constant/index';
import { AppUserListQuery } from './dto/app-user-query.dto';
import {
  AppUserCreate,
  AppUserCreateByAgent,
  AppUserRegister
} from './dto/create-app-user.dto';
import {
  AppUserUpdateBalance,
  AppUserUpdateDetail,
  AppUserUpdateProfile
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
      throw new NotFoundException(MESSAGE.notFoundError('用户'));
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

    if (appUser.is_verified) {
      throw new BadRequestException('你已经验证过了，不能更改。');
    }

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

    console.log(isExistedUser, '>>>>>');

    if (isExistedUser) {
      throw new BadRequestException(
        MESSAGE.isExistError('用户', 'with this Username'),
      );
    }

    if (!existAgent) {
      throw new NotFoundException(MESSAGE.notFoundError('代理人'));
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
    const { username, password, agent_code, is_real, amount, phone } = body;

    const newUser = await this.register(
      { username, password, agent_code },
      true,
    );

    newUser.is_real = is_real;
    newUser.balance = amount;
    newUser.balance_avail = amount;
    newUser.created_by = cms_user.username;
    newUser.phone = phone;

    await this._appUserRepo.save(newUser);
    return newUser;
  }

  async createByAgent(body: AppUserCreateByAgent, agent_user: PayLoad) {
    const { username, password, is_real, amount, phone } = body;

    const agent = await this._agentService.findOne(agent_user.id);

    const newUser = await this.register(
      {
        username,
        password,
        agent_code: agent.code,
      },
      true,
    );

    newUser.is_real = is_real;
    newUser.balance = amount;
    newUser.balance_avail = amount;
    newUser.created_by = agent_user.username;
    newUser.phone = phone;

    await this._appUserRepo.save(newUser);
    return newUser;
  }

  async findByUsername(username: string, isPartService?: boolean) {
    const user = await this._appUserRepo.findOne({
      where: { username, is_delete: false },
    });
    if (!user && !isPartService) {
      throw new NotFoundException(MESSAGE.notFoundError('应用程序用户'));
    }
    return user;
  }

  async getList(query: AppUserListQuery) {
    const { page, pageSize, superior, is_real, real_name, phone } = query;
    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;
    const whereConditions: Object = { is_delete: false };

    superior && Object.assign(whereConditions, { superior });
    real_name &&
      Object.assign(whereConditions, { real_name: Like(`%${real_name}%`) });
    phone && Object.assign(whereConditions, { phone: Like(`%${phone}%`) });
    is_real && Object.assign(whereConditions, { is_real });

    const total = await this._appUserRepo.countBy(whereConditions);
    const app_users = await this._appUserRepo.find({
      where: whereConditions,
      take,
      skip,
      order: {
        created_at: "DESC"
      }
    });

    return {
      count: app_users.length,
      data: app_users,
      total,
    };
  }

  async getListByAgent(query: AppUserListQuery, agent_id: number) {
    console.log(query, '>>>>>>>>');
    const { page, pageSize, superior, is_real, real_name, phone, username } =
      query;
    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    const agentUser = await this._agentService.findOne(agent_id);

    const queryBuilder = this._appUserRepo
      .createQueryBuilder('u')
      .innerJoinAndSelect('agent', 'ag', 'ag.id = u.agent')
      .select(['u.*', 'row_to_json(ag.*) as agent_detail']);

    queryBuilder.where(`ag.path like '${agentUser.path}%'`);
    is_real && queryBuilder.andWhere(`u.is_real = ${is_real}`);
    real_name && queryBuilder.andWhere(`u.real_name ilike '%${real_name}%'`);
    phone && queryBuilder.andWhere(`u.phone ilike '%${phone}%'`);
    username && queryBuilder.andWhere(`u.username ilike '%${username}%'`);

    if (superior) {
      const queryAgent = await this._agentService.findByUsername(superior);
      queryBuilder.andWhere(`ag.path like '${queryAgent.path}%'`);
    }

    const total = await queryBuilder.clone().getCount();
    const app_users = await queryBuilder.limit(take).offset(skip).orderBy('u.created_at', 'DESC').getRawMany();

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
    throw new NotFoundException(MESSAGE.notFoundError('应用程序用户'));
  }

  async updateProfile(user_id: number, body: AppUserUpdateProfile) {
    const user = await this.findOne(user_id);

    if (user.is_verified) {
      throw new BadRequestException('你已经验证过了，不能更改。');
    }

    const {
      real_name,
      phone,
      account_holder,
      id_number,
      bank_branch,
      bank_name,
      bank_number,
    } = body;

    real_name && Object.assign(user, { real_name });
    phone && Object.assign(user, { phone });
    account_holder && Object.assign(user, { account_holder });
    id_number && Object.assign(user, { id_number });
    bank_branch && Object.assign(user, { bank_branch });
    bank_name && Object.assign(user, { bank_name });
    bank_number && Object.assign(user, { bank_number });

    await this._appUserRepo.save(user);
    return { isSuccess: true };
  }

  async updateAppUser(user_id: number, body: AppUserUpdateDetail) {
    const user = await this.findOne(user_id);
    const { agent_code, phone, real_name, is_active, is_freeze } = body;

    const agent = await this._agentService.findByCode(agent_code);
    agent && Object.assign(user, { agent: agent.id, superior: agent.username });
    phone && Object.assign(user, { phone });
    real_name && Object.assign(user, { real_name });
    typeof is_active !== 'undefined' && Object.assign(user, { is_active });
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
      throw new BadRequestException(USER_MESSAGE.WRONG_OLD_PASSWORD);
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
        throw new BadRequestException(USER_MESSAGE.LACK_WITHDRAWAL_PW);
      }

      const compare = await bcrypt.compare(old_password, withdraw_password);

      if (!compare) {
        throw new BadRequestException(USER_MESSAGE.WRONG_OLD_PASSWORD);
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

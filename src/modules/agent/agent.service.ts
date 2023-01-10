import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Like, Repository } from 'typeorm';
import { ACCOUNT_TYPE, MODIFY_TYPE } from '../../common/enums';
import { MoneyLogCreate } from '../../components/money-log/dto/money-log-create.dto';
import { MoneyLogService } from '../../components/money-log/money-log.service';
import {
  PaginationQuery,
  SetPassword,
  UpdatePassword,
} from '../../helpers/dto-helper';
import { USER_MESSAGE } from './../../common/constant/error-message';
import { MESSAGE } from './../../common/constant/index';
import {
  AgentUserCreateByAdmin,
  AgentUserCreateByAgent,
} from './dto/agent-user-create.dto';
import { AgentUserListQuery } from './dto/agent-user-query.dto';
import { AgentUserUpdate } from './dto/agent-user-update.dto';
import { Agent } from './entities/agent.entity';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Agent)
    private readonly _agentRepo: Repository<Agent>,
    private readonly _moneyLogService: MoneyLogService,
  ) {}

  async create(body: AgentUserCreateByAdmin, isPartService?: boolean) {
    const { username, password, real_name, phone } = body;
    const existAgent = await this.findByUsername(username, true);
    if (existAgent) {
      throw new BadRequestException(
        MESSAGE.isExistError('Agent', 'with this Username'),
      );
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAgent = this._agentRepo.create({
      username,
      password: hashedPassword,
      real_name,
      phone,
    });
    if (isPartService) return newAgent;

    const newSave = await this._agentRepo.save(newAgent);
    newSave.path = newSave.id.toString();
    await this._agentRepo.save(newSave);

    return newSave;
  }

  async createByAgent(body: AgentUserCreateByAgent, agent_id: number) {
    const {
      username,
      password,
      real_name,
      phone,
      poundage_scale,
      deferred_fees_scale,
      receive_dividends_scale,
    } = body;
    const parentAgent = await this.findOne(agent_id);

    const newAgent = await this.create(
      {
        username,
        password,
        real_name,
        phone,
      },
      true,
    );
    Object.assign(newAgent, {
      parent: parentAgent.id,
      parent_name: parentAgent.username,
      level: parentAgent.level + 1,
      poundage_scale,
      deferred_fees_scale,
      receive_dividends_scale,
    });

    const newSave = await this._agentRepo.save(newAgent);
    newSave.path = `${parentAgent.path}.${newAgent.id}`;
    await this._agentRepo.save(newSave);

    return newSave;
  }

  async findAll(
    query: AgentUserListQuery | PaginationQuery,
    agent_id?: number,
  ) {
    const { page, pageSize, phone, real_name, path } = query as any;
    const take = +pageSize || 10;
    const skip = +pageSize * (+page - 1) || 0;

    let whereConditions: Object = { is_delete: false };
    phone && Object.assign(whereConditions, { phone });
    real_name && Object.assign(whereConditions, { real_name });
    path && Object.assign(whereConditions, { path: Like(`${path}.%`) });

    if (agent_id) {
      const currentAgent = await this.findOne(agent_id);
      whereConditions = {
        is_delete: false,
        path: Like(`${currentAgent.path}%`),
      };
    }

    const total = await this._agentRepo.countBy(whereConditions);
    const recs = await this._agentRepo.find({
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

  async findOne(id: number, agent_id?: number) {
    const whereConditions = { id, is_delete: false };

    if (agent_id) {
      const curAgent = await this._agentRepo.findOne({
        where: { id: agent_id, is_delete: false },
      });
      Object.assign(whereConditions, { path: Like(`${curAgent.path}.%`) });
    }

    const rec = await this._agentRepo.findOne({ where: whereConditions });
    if (!rec) {
      throw new NotFoundException(MESSAGE.notFoundError('Agent'));
    }
    return rec;
  }

  async findByCode(code?: string, isCreate?: boolean) {
    if (!code) return null;
    const rec = await this._agentRepo.findOne({
      where: { code, is_delete: false },
    });
    if (!rec && !isCreate) {
      throw new NotFoundException(MESSAGE.notFoundError('Agent'));
    }
    return rec;
  }

  async findByUsername(username: string, isPartService?: boolean) {
    const rec = await this._agentRepo.findOne({
      where: { username, is_delete: false },
    });
    if (!rec && !isPartService) {
      throw new NotFoundException(MESSAGE.notFoundError('Agent'));
    }
    return rec;
  }

  async update(id: number, updateAgentDto: AgentUserUpdate) {
    const { real_name, is_active, phone } = updateAgentDto;
    const rec = await this.findOne(id);

    real_name && Object.assign(rec, { real_name });
    typeof is_active !== 'undefined' && Object.assign(rec, { is_active });
    phone && Object.assign(rec, { phone });

    await this._agentRepo.save(rec);
    return { isSuccess: true };
  }

  // TODO
  async updateProfile(id: number, updateProfile: any) {}
  //

  async modifyFund(id: number, body: MoneyLogCreate) {
    const { type, amount, comments, remark } = body;
    const agentUser = await this.findOne(id);
    const { total_money } = agentUser;

    const newMoney =
      type == MODIFY_TYPE.INCREASE
        ? +total_money + amount
        : +total_money - amount;
    agentUser.total_money = newMoney;

    const moneyLogInfo = {
      user_id: id,
      amount,
      before: total_money,
      after: newMoney,
      type: type,
      user_type: ACCOUNT_TYPE.AGENT,
      comments,
      remark,
    };

    await Promise.all([
      this._agentRepo.save(agentUser),
      this._moneyLogService.insert(moneyLogInfo),
    ]);
  }

  async remove(id: number) {
    const agentUser = await this.findOne(id);
    agentUser.is_delete = true;
    await this._agentRepo.save(agentUser);

    return { isSuccess: true };
  }

  async updatePassword(id: number, body: UpdatePassword) {
    const { old_password, new_password } = body;

    const user = await this.findOne(id);
    const { password } = user;
    const compare = await bcrypt.compare(old_password, password);

    if (!compare) {
      throw new BadRequestException(USER_MESSAGE.WRONG_OLD_PASSWORD);
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(new_password, salt);
    await this._agentRepo.save(user);

    return { isSuccess: true };
  }

  async setPassword(id: number, body: SetPassword) {
    const { password } = body;

    const user = await this.findOne(id);

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(password, salt);
    await this._agentRepo.save(user);

    return { isSuccess: true };
  }
}

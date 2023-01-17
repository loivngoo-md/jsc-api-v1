import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as fetch from 'node-fetch';
import { MESSAGES } from '../../common/constant';
import { AgentService } from '../../modules/agent/agent.service';
import { Agent } from '../../modules/agent/entities/agent.entity';
import { AppUserService } from '../../modules/app-user/app-user.service';
import AppUser from '../../modules/app-user/entities/app-user.entity';
import { CmsUserService } from '../../modules/cms-user/cms-user.service';
import CmsUser from '../../modules/cms-user/entities/cms-user.entity';
import { BackendLogger } from '../logger/BackendLogger';
import { LoginRecordService } from '../login-record/login-record.service';
import { TOKEN_EXPIRES_IN } from './../../common/constant/constants';
import { LoginByUsernameDto } from './dto/LoginByUsernameDto';
import { LoginReturnDto } from './dto/LoginReturnDto';
import { PayLoad } from './dto/PayLoad';

@Injectable()
export class AuthService {
  private readonly logger = new BackendLogger(AuthService.name);

  constructor(
    private readonly _cmsUserService: CmsUserService,
    private readonly _jwtService: JwtService,
    private readonly _loginRecord: LoginRecordService,
    private readonly _appUserService: AppUserService,
    private readonly _agentUserService: AgentService,
  ) {}

  async validateCmsUser(payload: PayLoad): Promise<any> {
    const { username } = payload;

    const user = await this._cmsUserService.findByUsername(username, true);
    if (!user) {
      throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
    }
    return payload;
  }

  async validateAgentUser(payload: PayLoad): Promise<any> {
    const { username } = payload;

    const user = await this._agentUserService.findByUsername(username, true);
    if (!user) {
      throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
    }
    return payload;
  }

  async validateAppUser(payload: PayLoad): Promise<any> {
    const { username } = payload;

    const user = await this._appUserService.findByUsername(username, true);
    if (!user) {
      throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
    }
    return payload;
  }

  async loginAppViaUsername(
    LoginByUsernameDto: LoginByUsernameDto,
    ip: string,
  ): Promise<LoginReturnDto> {
    const { username, password } = LoginByUsernameDto;

    const user = await this._appUserService.findByUsername(username, true);
    const userPw = user ? user.password : '';
    const comparePw = await bcrypt.compare(password, userPw);

    if (!user || !comparePw) {
      throw new BadRequestException(MESSAGES.WRONG_SINGIN);
    }

    if (!user.is_active) {
      throw new BadRequestException(MESSAGES.APP_NOT_ACTIVE);
    }

    const options = {
      method: 'GET',
    };

    const ipgeo = await fetch(`${process.env.LEOIP_API}&ip=${ip}`, options)
      .then((response) => response.json())
      .then((result) => result)
      .catch((error) => console.log('error', error));

    const location = {
      user_id: user['id'],
      password: userPw,
      ip: ip,
      location: ipgeo.city?.name || '',
      created_at: new Date().getTime(),
    };

    await this._loginRecord.insert(location);

    // this.logger.log(`'${user.username}' ${MESSAGE.IS_LOGGED_IN}`);
    return this.createToken(user);
  }

  async loginAgentViaUsername(
    LoginByUsernameDto: LoginByUsernameDto,
  ): Promise<LoginReturnDto> {
    const { username, password } = LoginByUsernameDto;

    const user = await this._agentUserService.findByUsername(username, true);
    const userPw = user ? user.password : '';
    const comparePw = await bcrypt.compare(password, userPw);

    if (!user || !comparePw) {
      throw new BadRequestException(MESSAGES.WRONG_SINGIN);
    }

    if (!user.is_active) {
      throw new BadRequestException(MESSAGES.AGENT_NOT_ACTIVE);
    }

    // this.logger.log(`'${username}' ${MESSAGE.IS_LOGGED_IN}`);

    return this.createTokenForAgent(user);
  }

  async loginCmsViaUsername(
    LoginByUsernameDto: LoginByUsernameDto,
    ip: string,
  ): Promise<LoginReturnDto> {
    const { username, password } = LoginByUsernameDto;

    const user = await this._cmsUserService.findByUsername(username, true);
    const userPw = user ? user.password : '';
    const comparePw = await bcrypt.compare(password, userPw);

    if (!user || !comparePw) {
      throw new BadRequestException(MESSAGES.WRONG_SINGIN);
    }

    if (!user.is_active) {
      throw new BadRequestException(MESSAGES.CMS_NOT_ACTIVE);
    }

    return this.createToken(user);
  }

  async createToken(user: CmsUser | AppUser | Agent): Promise<LoginReturnDto> {
    const token = this._jwtService.sign(
      {
        username: user.username,
        id: user.id,
      },
      { secret: process.env.SECRET_KEY_JWT },
    );
    const response: LoginReturnDto = {
      access_token: token,
      expiresIn: TOKEN_EXPIRES_IN,
    };

    return response;
  }

  async createTokenForAgent(user: Agent): Promise<LoginReturnDto> {
    const token = this._jwtService.sign(
      {
        username: user.username,
        id: user.id,
        path: user.path,
      },
      { secret: process.env.SECRET_KEY_JWT },
    );
    const response: LoginReturnDto = {
      access_token: token,
      expiresIn: TOKEN_EXPIRES_IN,
    };

    return response;
  }
}

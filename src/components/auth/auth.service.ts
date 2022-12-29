import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as fetch from 'node-fetch';
import { AppUserService } from '../../modules/app-user/app-user.service';
import AppUser from '../../modules/app-user/entities/app-user.entity';
import { CmsUserService } from '../../modules/cms-user/cms-user.service';
import CmsUser from '../../modules/cms-user/entities/cms-user.entity';
import { AgentService } from '../agent/agent.service';
import { Agent } from '../agent/entities/agent.entity';
import { BackendLogger } from '../logger/BackendLogger';
import { LoginRecordService } from '../login-record/login-record.service';
import { TOKEN_EXPIRES_IN } from './../../common/constant/constants';
import { INVALID_TOKEN } from './../../common/constant/error-message';
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

    const user = await this._cmsUserService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException(INVALID_TOKEN);
    }
    return payload;
  }

  async validateAgentUser(payload: PayLoad): Promise<any> {
    const { username } = payload;

    const user = await this._agentUserService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException(INVALID_TOKEN);
    }
    return payload;
  }

  async validateAppUser(payload: PayLoad): Promise<any> {
    const { username } = payload;

    const user = await this._appUserService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException(INVALID_TOKEN);
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
      throw new NotFoundException('Wrong password or username');
    }

    if (!user.is_active) {
      throw new BadRequestException('User not active.');
    }

    const requestOptions = {
      method: 'GET',
    };

    const ipgeo = await fetch(
      `https://api.geoapify.com/v1/ipinfo?&apiKey=c93f71baa0ed44c09ba7ae01a7a76f5b&ip=${ip}`,
      requestOptions,
    )
      .then((response) => response.json())
      .then((result) => result)
      .catch((error) => console.log('error', error));

    const location = {
      user_id: user['id'],
      password: '',
      ip: ip,
      location: ipgeo.city?.name || '',
      created_at: new Date(),
    };

    await this._loginRecord.insert(location);

    this.logger.log(
      `username '${user.username}' is currently logged into the app system`,
    );

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
      throw new NotFoundException('Wrong password or username');
    }

    if (!user.is_active) {
      throw new BadRequestException('User not active.');
    }

    this.logger.log(
      `username '${user.username}' is currently logged into the agent system`,
    );

    return this.createToken(user);
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
      throw new NotFoundException('Wrong password or username');
    }

    if (!user.is_active) {
      throw new BadRequestException('User not active.');
    }

    this.logger.log(
      `username '${user.username}' is currently logged into the cms system`,
    );

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
}

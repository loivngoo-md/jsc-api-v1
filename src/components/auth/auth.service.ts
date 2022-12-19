import {
  INVALID_PASSWORD,
  INVALID_TOKEN,
  INVALID_USERNAME,
} from './../../common/constant/error-message';
import { TOKEN_EXPIRES_IN } from './../../common/constant/constants';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BackendLogger } from '../logger/BackendLogger';
import * as bcrypt from 'bcryptjs';
import { LoginByUsernameDto } from './dto/LoginByUsernameDto';
import { LoginReturnDto } from './dto/LoginReturnDto';
import { PayLoad } from './dto/PayLoad';
import * as fetch from 'node-fetch';
import { LoginRecordService } from '../login-record/login-record.service';
import { CmsUserService } from '../../modules/cms-user/cms-user.service';
import { AppUserService } from '../../modules/app-user/app-user.service';
import CmsUser from '../../modules/cms-user/entities/cms-user.entity';
import AppUser from '../../modules/app-user/entities/app-user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new BackendLogger(AuthService.name);

  constructor(
    @Inject(forwardRef(() => CmsUserService))
    private readonly _cmsUserService: CmsUserService,
    private readonly _jwtService: JwtService,
    private readonly _loginRecord: LoginRecordService,
    private readonly _appUserService: AppUserService,
  ) {}

  async validateCmsUser(payload: PayLoad): Promise<any> {
    const { username } = payload;

    const user = await this._cmsUserService.findByUsername(username);
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
    const { username } = LoginByUsernameDto;

    const user = await this._appUserService.findByUsername(username);

    if (!user) {
      throw new NotFoundException(INVALID_USERNAME);
    }

    if (!(await this.validatePassword(user, LoginByUsernameDto.password))) {
      throw new NotFoundException(INVALID_PASSWORD);
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

  async loginCmsViaUsername(
    LoginByUsernameDto: LoginByUsernameDto,
    ip: string,
  ): Promise<LoginReturnDto> {
    const { username } = LoginByUsernameDto;

    const user = await this._cmsUserService.findByUsername(username);

    console.log(user);

    if (!user) {
      throw new NotFoundException(INVALID_USERNAME);
    }

    if (!(await this.validatePassword(user, LoginByUsernameDto.password))) {
      throw new NotFoundException(INVALID_PASSWORD);
    }

    this.logger.log(
      `username '${user.username}' is currently logged into the cms system`,
    );

    return this.createToken(user);
  }

  async validatePassword(
    user: CmsUser | AppUser,
    password: string,
  ): Promise<boolean> {
    return await bcrypt.compareSync(password, user.password);
  }

  async createToken(user: CmsUser | AppUser): Promise<LoginReturnDto> {
    const token = this._jwtService.sign(
      {
        username: user.username,
        id: user.id,
      },
      { secret: process.env.SECRET_KEY_JWT },
    );
    const response: LoginReturnDto = {
      token,
      expiresIn: TOKEN_EXPIRES_IN,
    };

    return response;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SessionMiddleware } from '../../middleware/session.middleware';
import { BackendLogger } from '../logger/BackendLogger';
import { MESSAGES } from './../../common/constant/index';
import { AuthService } from './auth.service';
import { PayLoad } from './dto/PayLoad';

@Injectable()
export class CmsStrategy extends PassportStrategy(Strategy, 'cms') {
  private readonly logger = new BackendLogger(CmsStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY_JWT,
    });
  }

  async validate(payload: PayLoad) {
    const user = await this.authService.validateCmsUser(payload);
    if (!user) {
      throw new UnauthorizedException(MESSAGES.UNAUTHORIZED);
    }
    SessionMiddleware.set('session_user', user);
    return user;
  }
}

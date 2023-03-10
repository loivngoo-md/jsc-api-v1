import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BackendLogger } from '../../components/logger/BackendLogger';
import { SessionMiddleware } from '../../middleware/session.middleware';
import { MESSAGE } from './../../common/constant/index';
import { AuthService } from './auth.service';
import { PayLoad } from './dto/PayLoad';

@Injectable()
export class AppStrategy extends PassportStrategy(Strategy, 'app') {
  private readonly logger = new BackendLogger(AppStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY_JWT,
    });
  }

  async validate(payload: PayLoad) {
    const user = await this.authService.validateAppUser(payload);
    if (!user) {
      throw new UnauthorizedException(MESSAGE.UNAUTHORIZED);
    }
    SessionMiddleware.set('session_user', user);
    return user;
  }
}

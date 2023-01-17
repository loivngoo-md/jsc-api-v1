import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BackendLogger } from '../../components/logger/BackendLogger';
import { SessionMiddleware } from '../../middleware/session.middleware';
import { MESSAGES } from './../../common/constant/index';
import { AuthService } from './auth.service';
import { PayLoad } from './dto/PayLoad';

@Injectable()
export class AgentStrategy extends PassportStrategy(Strategy, 'agent') {
  private readonly logger = new BackendLogger(AgentStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY_JWT,
    });
  }

  async validate(payload: PayLoad) {
    const user = await this.authService.validateAgentUser(payload);
    if (!user) {
      throw new UnauthorizedException(MESSAGES.UNAUTHORIZED);
    }
    SessionMiddleware.set('session_user', user);
    return user;
  }
}

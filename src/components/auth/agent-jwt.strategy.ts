import { AuthService } from './auth.service';
import { BackendLogger } from '../../components/logger/BackendLogger';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PayLoad } from './dto/PayLoad';
import { PassportStrategy } from '@nestjs/passport';
import { SessionMiddleware } from '../../middleware/session.middleware';

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
      this.logger.debug(`Invalid/expired payload: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException(
        'The current user is not logged in to the system',
      );
    }
    SessionMiddleware.set('session_user', user);
    return user;
  }
}

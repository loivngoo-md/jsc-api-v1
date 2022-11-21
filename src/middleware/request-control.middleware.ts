import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as morgan from 'morgan';
import { BackendLogger } from '../components/logger/BackendLogger';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: BackendLogger) {}
  use(req: Request, res: Response, next: NextFunction) {
    morgan('dev', {
      stream: { write: (str) => this.logger.debug(str) },
    });
    next();
  }
}

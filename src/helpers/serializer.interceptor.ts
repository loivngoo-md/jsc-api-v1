/**
import appUserResponseSerializer from 'src/components/app-user/app-user-response-serializer';
import AppUser from 'src/components/app-user/entities/app-user.entity';
import CmsUser from 'src/components/cms-user/entities/cms-user.entity';
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import deepMapObject from './deep-map-object';

@Injectable()
export class SerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        return deepMapObject(data, (value) => {
          if (value?.password) {
            delete value.password;
          }
          if (value?.withdraw_password || value?.withdraw_password === null || value?.withdraw_password == "") {
            delete value.withdraw_password;
          }
          return value;
        });
      }),
    );
  }
}

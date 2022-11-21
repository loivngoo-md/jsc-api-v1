import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CmsAuthGuard extends AuthGuard('cms') {}

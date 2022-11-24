import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginByUsernameDto } from './dto/LoginByUsernameDto';
import { RealIP } from 'nestjs-real-ip';
import { CmsUserService } from '../cms-user/cms-user.service';
import { CreateCmsUserDto } from '../cms-user/dto/create-cms-user.dto';
import { GetCurrentCmsUser } from './guards/cms-user.decorator';
import { AppUserService } from '../app-user/app-user.service';
import { AppAuthGuard } from './guards/appAuth.guard';
import { CmsAuthGuard } from './guards/cmsAuth.guard';
import { CreateAppUserDto } from '../app-user/dto/create-app-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly _cmsUserService: CmsUserService,
    private readonly _appUserService: AppUserService,
  ) {}

  @UseGuards(AppAuthGuard)
  @Get('/get-app')
  async getCurrentAppInfo(@GetCurrentCmsUser() user) {
    const response = await this._appUserService.findOne(user['id']);
    return response;
  }

  @UseGuards(CmsAuthGuard)
  @Get('/get-cms')
  async getCurrentCmsInfo(@GetCurrentCmsUser() user) {
    const response = await this._cmsUserService.findByUsername(user.username);
    return response;
  }

  @Post('/signup/cms')
  async signupCms(@Body() input: CreateCmsUserDto) {
    return this._cmsUserService.create(input);
  }

  @Post('/signup/app')
  async signupApp(@Body() input: CreateAppUserDto) {
    return this._appUserService.create(input);
  }

  @Post('login/cms')
  async loginCms(@Body() input: LoginByUsernameDto, @RealIP() ip: string) {
    try {
      return this.authService.loginCmsViaUsername(input, ip);
    } catch (error) {
      throw error;
    }
  }

  @Post('login/app')
  async loginApp(@Body() input: LoginByUsernameDto, @RealIP() ip: string) {
    try {
      return this.authService.loginAppViaUsername(input, ip);
    } catch (error) {
      throw error;
    }
  }
}

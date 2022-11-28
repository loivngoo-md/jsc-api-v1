import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { AppUserService } from '../app-user/app-user.service';
import { CreateAppUserDto } from '../app-user/dto/create-app-user.dto';
import { AuthService } from '../auth/auth.service';
import { LoginByUsernameDto } from '../auth/dto/LoginByUsernameDto';
import MoneyLog from '../money-log/entities/money-log.entity';
import { MoneyLogService } from '../money-log/money-log.service';
import { CmsUserService } from './cms-user.service';
import { CreateCmsUserDto } from './dto/create-cms-user.dto';
import { UpdateCmsUserDto } from './dto/update-cms-user.dto';

@Controller('cms')
export class CmsUserController {
  constructor(
    private readonly cmsUserService: CmsUserService,
    private readonly appUserService: AppUserService,
    private readonly moneyLogService: MoneyLogService,
    private readonly authService: AuthService,
  ) { }

  @Post('login')
  async loginCms(@Body() input: LoginByUsernameDto, @RealIP() ip: string) {
    try {
      return this.authService.loginCmsViaUsername(input, ip);
    } catch (error) {
      throw error;
    }
  }

  @Post('app-users/verified/:id')
  verificationAppUserAccount(@Param('id') id: string) {
    return this.appUserService.verifiedAccount(+id);
  }

  @Post('app-users/modified-balance/:id')
  async modifiedAppUser(
    @Body()
    dto: {
      amount: number;
      type: number;
      comments: string;
      remark: string;
    },
    @Param('id') id: string,
  ) {
    const modified = await this.appUserService.modifiedBalance(+id, dto);
    return this.moneyLogService.insert(modified);
  }

  @Post('app-users')
  createNewAppUser(@Body() createAppUserDto: CreateAppUserDto) {
    return this.appUserService.create(createAppUserDto);
  }

  @Patch('app-users/:id')
  updateAppUser(
    @Body() updateAppUserDto: CreateAppUserDto,
    @Param('id') id: string,
  ) {
    return this.appUserService.update(+id, updateAppUserDto);
  }

  @Delete('app-users/:id')
  detroyAppUser(@Param('id') id: string) {
    return this.appUserService.update(+id, { is_active: false });
  }

  @Get('/app-users')
  findAllWithPagging(
    @Query() query: { page: number; limit: number; search?: string },
  ) {
    return this.appUserService.getAppUserWithPagging(query);
  }

  @Get('app-users/:id')
  getAAppUser(@Param('id') id: string) {
    return this.appUserService.findOne(+id);
  }

  @Post()
  create(@Body() createCmsUserDto: CreateCmsUserDto) {
    return this.cmsUserService.create(createCmsUserDto);
  }

  @Get()
  findAll() {
    return this.cmsUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cmsUserService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCmsUserDto: UpdateCmsUserDto) {
    return this.cmsUserService.update(+id, updateCmsUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appUserService.update(+id, { is_active: false })
  }
}

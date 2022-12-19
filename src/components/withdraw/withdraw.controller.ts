import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PayLoad } from '../auth/dto/PayLoad';
import { GetCurrentAppUser } from '../auth/guards/app-user.decorator';
import { AppAuthGuard } from '../auth/guards/appAuth.guard';
import { CmsAuthGuard } from '../auth/guards/cmsAuth.guard';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { WithdrawService } from './withdraw.service';

@Controller('withdrawals')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @UseGuards(AppAuthGuard)
  @Post('/app')
  createOnApp(
    @Body() createWithdrawDto: CreateWithdrawDto,
    @GetCurrentAppUser() user: PayLoad,
  ) {
    createWithdrawDto['username'] = user['username'];
    return this.withdrawService.create(createWithdrawDto);
  }

  @UseGuards(CmsAuthGuard)
  @Post('/cms')
  createOnCms(@Body() createWithdrawDto: CreateWithdrawDto) {
    return this.withdrawService.create(createWithdrawDto, true);
  }

  // @UseGuards(AppAuthGuard)
  // @Post('/approve')
  // approve(@Body() body: any) {
  //   const { user_id, withdraw_id, amount } = body;
  //   return this.withdrawService.reviewByCms(withdraw_id, user_id, amount);
  // }

  @UseGuards(AppAuthGuard)
  @Get()
  findAll(@GetCurrentAppUser() user: PayLoad) {
    return this.withdrawService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.withdrawService.findOne(+id);
  }
}

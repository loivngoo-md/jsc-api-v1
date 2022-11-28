import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { AppAuthGuard } from '../auth/guards/appAuth.guard';
import { CmsAuthGuard } from '../auth/guards/cmsAuth.guard';
import { GetCurrentAppUser } from '../auth/guards/app-user.decorator';
import { PayLoad } from '../auth/dto/PayLoad';

@Controller('withdrawals')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @UseGuards(AppAuthGuard)
  @Post('/app')
  createOnApp(
    @Body() createWithdrawDto: CreateWithdrawDto,
    @GetCurrentAppUser() user,
  ) {
    return this.withdrawService.userPerformWithdraw(createWithdrawDto, user);
  }

  @UseGuards(CmsAuthGuard)
  @Post('/cms')
  createOnCms(@Body() createWithdrawDto: CreateWithdrawDto) {
    return this.withdrawService.cmsPerformWithdraw(createWithdrawDto);
  }

  @UseGuards(CmsAuthGuard)
  @Post('/approve')
  approve(
    @Body() body: any,
  ) {
    const { user_id, withdraw_id, amount } = body;
    return this.withdrawService.approve(withdraw_id, user_id, amount);
  }

  @Get()
  findAll() {
    return this.withdrawService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.withdrawService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWithdrawDto: UpdateWithdrawDto,
  ) {
    return this.withdrawService.update(+id, updateWithdrawDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.withdrawService.remove(+id);
  }
}

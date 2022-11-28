import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PayLoad } from '../auth/dto/PayLoad';
import { GetCurrentAppUser } from '../auth/guards/app-user.decorator';
import { AppAuthGuard } from '../auth/guards/appAuth.guard';
import { DepositService } from './deposit.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';

@Controller('deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) { }

  @Post('/cms')
  appCreate(@Body() createDepositDto: CreateDepositDto) {
    return this.depositService.create(createDepositDto);
  }

  @UseGuards(AppAuthGuard)
  @Post('/app')
  cmsCreate(
    @Body() dto: CreateDepositDto,
    @GetCurrentAppUser() appUser: PayLoad,
  ) {
    dto['user_id'] = Number(appUser['id']);
    return this.depositService.create(dto);
  }


  @UseGuards(AppAuthGuard)
  @Get()
  findAll(
    @GetCurrentAppUser() user: PayLoad
  ) {
    return this.depositService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.depositService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDepositDto: UpdateDepositDto) {
    return this.depositService.update(+id, updateDepositDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.depositService.remove(+id);
  }
}

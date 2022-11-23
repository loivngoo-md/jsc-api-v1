import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DepositAccountService } from './deposit-account.service';
import { CreateDepositAccountDto } from './dto/create-deposit-account.dto';
import { UpdateDepositAccountDto } from './dto/update-deposit-account.dto';

@Controller('deposit-account')
export class DepositAccountController {
  constructor(private readonly depositAccountService: DepositAccountService) {}

  @Post()
  create(@Body() createDepositAccountDto: CreateDepositAccountDto) {
    return this.depositAccountService.create(createDepositAccountDto);
  }

  @Get()
  findAll() {
    return this.depositAccountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.depositAccountService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDepositAccountDto: UpdateDepositAccountDto,
  ) {
    return this.depositAccountService.update(+id, updateDepositAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.depositAccountService.remove(+id);
  }
}

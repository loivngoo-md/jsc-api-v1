import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { GetCurrentAppUser } from '../auth/guards/app-user.decorator';
import { AppAuthGuard } from '../auth/guards/appAuth.guard';
import { AppUserService } from '../app-user/app-user.service';
import { TransactionType } from 'src/common/enums';

@UseGuards(AppAuthGuard)
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly appUserService: AppUserService
  ) { }

  @Post()
  async create(@Body() dto: CreateTransactionDto, @GetCurrentAppUser() user) {
    dto.user_id = user.id
    dto.created_at = new Date()

    const appUser = await this.appUserService.findOne(user.id)
    dto.before = appUser.balance

    if (dto.type === TransactionType.DEPOSIT) { }
    if (dto.type === TransactionType.WITHDRAW) { }
    if (dto.type === TransactionType.BUY) {

    }
    if (dto.type === TransactionType.SELL) {
      dto.amount = (dto.quantity * 1000).toString()
    }


    return this.transactionService.create(dto);
  }

  @Get()
  findAll() {
    return this.transactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }
}

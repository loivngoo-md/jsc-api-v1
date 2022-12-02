import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PayLoad } from '../auth/dto/PayLoad';
import { GetCurrentAppUser } from '../auth/guards/app-user.decorator';
import { AppUserService } from './app-user.service';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';
import LocalFilesInterceptor from 'src/middleware/localFiles.interceptor';
import { AppAuthGuard } from '../auth/guards/appAuth.guard'
import { ClosePositionDto, CreateOrderDto } from '../order/dto/create-order.dto';
import { ORDER_TYPE } from 'src/common/enums';
import { OrderService } from '../order/order.service';
import { CreateWithdrawDto } from '../withdraw/dto/create-withdraw.dto';
import { WithdrawService } from '../withdraw/withdraw.service';
import { CreateDepositDto } from '../deposit/dto/create-deposit.dto';
import { DepositService } from '../deposit/deposit.service';
import { StockStorageService } from '../stock-storage/stock-storage.service';
import { PositionQuery, SellablePositionsQuery } from './dto/positions-pagination.dto';


@Controller('app')
export class AppUserController {
  constructor(
    private readonly appUserService: AppUserService,
    private readonly orderService: OrderService,
    private readonly withdrawService: WithdrawService,
    private readonly stockStorageService: StockStorageService,
    private readonly depositService: DepositService
  ) { }

  @Post()
  create(@Body() createAppUserDto: CreateAppUserDto) {
    return this.appUserService.create(createAppUserDto);
  }

  @Get()
  findAll() {
    return this.appUserService.findAll();
  }


  @UseGuards(AppAuthGuard)
  @Patch()
  update(@GetCurrentAppUser() user: PayLoad, @Body() updateAppUserDto: UpdateAppUserDto) {
    return this.appUserService.update(user.id, updateAppUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appUserService.remove(+id);
  }

  @Post('upload')
  @UseGuards(AppAuthGuard)
  @UseInterceptors(LocalFilesInterceptor({
    fieldName: 'file',
  }))
  async addCCCD(
    @GetCurrentAppUser() user: PayLoad,
    @UploadedFile() file: Express.Multer.File,
    @Query() query: string
  ) {
    return this.appUserService.addFrontBackCCCD(user.id, {
      path: file.path,
      filename: file.filename,
      mimetype: file.mimetype
    }, {
      type: Number(query['type'])
    });
  }


  @UseGuards(AppAuthGuard)
  @Patch('profit')
  async update_customer_profit(
    @GetCurrentAppUser() customer: PayLoad
  ) {
    return this.appUserService.update_customer_profit(customer['id'])
  }

  @UseGuards(AppAuthGuard)
  @Patch('hold-value')
  async update_customer_hold_value(
    @GetCurrentAppUser() customer: PayLoad
  ) {
    return this.appUserService.update_customer_hold_value(customer['id'])

  }

  @UseGuards(AppAuthGuard)
  @Patch('balance-frozen')
  async update_customer_balance_frozen(
    @GetCurrentAppUser() customer: PayLoad
  ) {
    return this.appUserService.update_customer_balance_frozen(customer['id'])

  }

  @UseGuards(AppAuthGuard)
  @Patch('balance-avail')
  async update_customer_balance_avail(
    @GetCurrentAppUser() customer: PayLoad
  ): Promise<any> {
    return this.appUserService.update_customer_balance_avail(customer['id'])
  }

  @UseGuards(AppAuthGuard)
  @Patch('freeze')
  async update_customer_is_freeze(
    @GetCurrentAppUser() customer: PayLoad
  ) {
    return this.appUserService.freeze_account(customer['id'])
  }

  @UseGuards(AppAuthGuard)
  @Post("buy")
  async buyStock(
    @Body() dto: CreateOrderDto,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {

    if (dto['type'] != ORDER_TYPE.BUY) {
      throw new BadRequestException()
    }
    dto['user_id'] = userFromToken['id']

    return this.orderService.buyOnApp(dto)
  }

  @UseGuards(AppAuthGuard)
  @Post("sell/:position_id")
  async sellStock(
    @Param('position_id') position_id: string,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.orderService.sellOnApp(position_id, userFromToken.id)
  }

  @UseGuards(AppAuthGuard)
  @Post('/withdrawal')
  createOnApp(
    @Body() createWithdrawDto: CreateWithdrawDto,
    @GetCurrentAppUser() user,
  ) {
    return this.withdrawService.userPerformWithdraw(createWithdrawDto, user);
  }

  @UseGuards(AppAuthGuard)
  @Post('/deposit')
  cmsCreate(
    @Body() dto: CreateDepositDto,
    @GetCurrentAppUser() appUser: PayLoad,
  ) {
    dto['user_id'] = appUser['id'];
    return this.depositService.create(dto);
  }

  @UseGuards(AppAuthGuard)
  @Get("positions/sellable")
  async getSellablePositions(
    @Query() query: SellablePositionsQuery,
    @GetCurrentAppUser() userFromToken: PayLoad
  ) {
    if(!query.stock_code) {
      throw new NotFoundException()
    }
    
    return this.stockStorageService.getSellablePositions(userFromToken.id, query)
  }

  @UseGuards(AppAuthGuard)
  @Get("positions")
  async getUserPosition(
    @Query() query: PositionQuery,
    @GetCurrentAppUser() userFromToken: PayLoad
  ) {
    return this.stockStorageService.findUserPostions(userFromToken['id'], query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appUserService.findOne(+id);
  }
}

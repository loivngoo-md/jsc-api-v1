import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ORDER_TYPE } from '../../common/enums';
import { PayLoad } from '../../components/auth/dto/PayLoad';
import { GetCurrentAppUser } from '../../components/auth/guards/app-user.decorator';
import { AppAuthGuard } from '../../components/auth/guards/appAuth.guard';
import { DepositService } from '../../components/deposit/deposit.service';
import { CreateDepositDto } from '../../components/deposit/dto/create-deposit.dto';
import { DepositQuery } from '../../components/deposit/dto/query-deposit.dto';
import { QueryFavorite } from '../../components/favorite-stock/dto/query-favorite.dto';
import { FavoriteStockService } from '../../components/favorite-stock/favorite-stock.service';
import { CreateOrderDto } from '../../components/order/dto/create-order.dto';
import { OrderQuery } from '../../components/order/dto/query-order.dto';
import { OrderService } from '../../components/order/order.service';
import { StockStorageService } from '../../components/stock-storage/stock-storage.service';
import { CreateWithdrawDto } from '../../components/withdraw/dto/create-withdraw.dto';
import { WithdrawalQuery } from '../../components/withdraw/dto/query-withdrawal.dto';
import { WithdrawService } from '../../components/withdraw/withdraw.service';
import LocalFilesInterceptor from '../../middleware/localFiles.interceptor';
import { AppUserService } from './app-user.service';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import {
  PositionQuery,
  SellablePositionsQuery,
} from './dto/positions-pagination.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';

@Controller('app')
export class AppUserController {
  constructor(
    private readonly appUserService: AppUserService,
    private readonly orderService: OrderService,
    private readonly withdrawService: WithdrawService,
    private readonly stockStorageService: StockStorageService,
    private readonly depositService: DepositService,
    private readonly favoriteStockService: FavoriteStockService,
  ) {}

  // CRUD
  @Post()
  create(@Body() createAppUserDto: CreateAppUserDto) {
    return this.appUserService.create(createAppUserDto);
  }

  @Get('user')
  findAll() {
    return this.appUserService.findAll();
  }

  @Get('user/:id')
  findOne(@Param('id') id: string) {
    return this.appUserService.findOne(+id);
  }

  @UseGuards(AppAuthGuard)
  @Patch('user')
  update(
    @GetCurrentAppUser() user: PayLoad,
    @Body() updateAppUserDto: UpdateAppUserDto,
  ) {
    return this.appUserService.update(user.id, updateAppUserDto);
  }

  @Delete('user/:id')
  remove(@Param('id') id: string) {
    return this.appUserService.remove(+id);
  }

  // Add CCCD
  @Post('user/upload')
  @UseGuards(AppAuthGuard)
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'file',
    }),
  )
  async addCCCD(
    @GetCurrentAppUser() user: PayLoad,
    @UploadedFile() file: Express.Multer.File,
    @Query() query: string,
  ) {
    return this.appUserService.addFrontBackCCCD(
      user.id,
      {
        path: file.path,
        filename: file.filename,
        mimetype: file.mimetype,
      },
      {
        type: Number(query['type']),
      },
    );
  }

  // User Account
  @UseGuards(AppAuthGuard)
  @Patch('account/profit')
  async update_customer_profit(@GetCurrentAppUser() customer: PayLoad) {
    return this.appUserService.update_customer_profit(customer['id']);
  }

  @UseGuards(AppAuthGuard)
  @Patch('account/hold-value')
  async update_customer_hold_value(@GetCurrentAppUser() customer: PayLoad) {
    return this.appUserService.update_customer_hold_value(customer['id']);
  }

  @UseGuards(AppAuthGuard)
  @Patch('account/balance-frozen')
  async update_customer_balance_frozen(@GetCurrentAppUser() customer: PayLoad) {
    return this.appUserService.update_customer_balance_frozen(customer['id']);
  }

  @UseGuards(AppAuthGuard)
  @Patch('account/balance-avail')
  async update_customer_balance_avail(
    @GetCurrentAppUser() customer: PayLoad,
  ): Promise<any> {
    return this.appUserService.update_customer_balance_avail(customer['id']);
  }

  @UseGuards(AppAuthGuard)
  @Patch('account/freeze')
  async update_customer_is_freeze(@GetCurrentAppUser() customer: PayLoad) {
    return this.appUserService.freeze_account(customer['id']);
  }

  // Deposit
  @UseGuards(AppAuthGuard)
  @Get('deposit/list')
  async getAllDeposits(
    @Query() query: DepositQuery,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.depositService.findAll(query, userFromToken['id']);
  }

  @UseGuards(AppAuthGuard)
  @Post('deposit/create')
  async createDeposit(
    @Body() dto: CreateDepositDto,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    dto['user_id'] = userFromToken['id'];
    return this.depositService.create(dto);
  }

  // Withdrawal
  @UseGuards(AppAuthGuard)
  @Get('withdrawal/list')
  async getAllWithdrawals(
    @Query() query: WithdrawalQuery,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.withdrawService.findAll(query, userFromToken['id']);
  }

  @UseGuards(AppAuthGuard)
  @Post('withdrawal/create')
  createOnApp(
    @Body() dto: CreateWithdrawDto,
    @GetCurrentAppUser() user: PayLoad,
  ) {
    dto['username'] = user['username'];
    return this.withdrawService.create(dto);
  }

  // Order
  @UseGuards(AppAuthGuard)
  @Post('order/list')
  async getListOrder(
    @Query() query: OrderQuery,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.orderService.listAllOrders(query, userFromToken['id']);
  }

  @UseGuards(AppAuthGuard)
  @Post('order/buy')
  async buyStock(
    @Body() dto: any,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    dto['user_id'] = userFromToken['id'];
    return this.orderService.buy(dto);
  }

  @UseGuards(AppAuthGuard)
  @Get('order/positions')
  async getUserPosition(
    @Query() query: PositionQuery,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.stockStorageService.findUserPostions(
      userFromToken['id'],
      query,
    );
  }

  @UseGuards(AppAuthGuard)
  @Post('order/sell/:position_id')
  async sellStock(
    @Param('position_id') position_id: string,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.orderService.sell(position_id, userFromToken['id']);
  }

  @UseGuards(AppAuthGuard)
  @Get('order/positions-sellable')
  async getSellablePositions(
    @Query() query: SellablePositionsQuery,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    if (!query.stock_code) {
      throw new NotFoundException();
    }

    return this.stockStorageService.getSellablePositions(
      userFromToken.id,
      query,
    );
  }

  @UseGuards(AppAuthGuard)
  @Get('/favorite/list')
  async getFavoriteListStock(
    @Query() query: QueryFavorite,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    query['user_id'] = +userFromToken['id'];
    return this.favoriteStockService.get_list(query);
  }

  @UseGuards(AppAuthGuard)
  @Patch('/favorite/like/:fs')
  async addFavoriteStock(
    @Param('fs') fs: string,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.favoriteStockService.create(userFromToken.id, fs);
  }

  @UseGuards(AppAuthGuard)
  @Patch('/favorite/dislike/:fs')
  async removeFavoriteStock(
    @Param('fs') fs: string,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.favoriteStockService.remove(userFromToken.id, fs);
  }
}

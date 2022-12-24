import {
  Body,
  Controller,
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
import { ApiTags } from '@nestjs/swagger';
import { RealIP } from 'nestjs-real-ip';
import { StockService } from 'src/components/stock/stock.service';
import { AuthService } from '../../components/auth/auth.service';
import { LoginByUsernameDto } from '../../components/auth/dto/LoginByUsernameDto';
import { PayLoad } from '../../components/auth/dto/PayLoad';
import { GetCurrentAppUser } from '../../components/auth/guards/app-user.decorator';
import { AppAuthGuard } from '../../components/auth/guards/appAuth.guard';
import { DepositAccountService } from '../../components/deposit-account/deposit-account.service';
import { DepositService } from '../../components/deposit/deposit.service';
import { CreateDepositDto } from '../../components/deposit/dto/create-deposit.dto';
import { QueryFavorite } from '../../components/favorite-stock/dto/query-favorite.dto';
import { FavoriteStockService } from '../../components/favorite-stock/favorite-stock.service';
import { OrderQuery } from '../../components/order/dto/query-order.dto';
import { OrderService } from '../../components/order/order.service';
import { StockStorageService } from '../../components/stock-storage/stock-storage.service';
import { TradingSessionService } from '../../components/trading-session/trading-session.service';
import { CreateWithdrawDto } from '../../components/withdraw/dto/create-withdraw.dto';
import { WithdrawalQuery } from '../../components/withdraw/dto/query-withdrawal.dto';
import { WithdrawService } from '../../components/withdraw/withdraw.service';
import { PaginationQuery } from '../../helpers/dto-helper';
import LocalFilesInterceptor from '../../middleware/localFiles.interceptor';
import { id } from './../../common/constant/router.constant';
import { DepositQuery } from './../../components/deposit/dto/query-deposit.dto';
import { TransactionsService } from './../../components/transactions/transactions.service';
import { AppUserService } from './app-user.service';
import {
  PositionQuery,
  SellablePositionsQuery,
} from './dto/positions-pagination.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';

@ApiTags('APP')
@Controller('app')
export class AppUserController {
  constructor(
    private readonly authService: AuthService,
    private readonly appUserService: AppUserService,
    private readonly orderService: OrderService,
    private readonly withdrawService: WithdrawService,
    private readonly stockStorageService: StockStorageService,
    private readonly depositService: DepositService,
    private readonly favoriteStockService: FavoriteStockService,
    private readonly stockService: StockService,
    private readonly tradingSessionService: TradingSessionService,
    private readonly depositAccountService: DepositAccountService,
    private readonly trxService: TransactionsService,
  ) {}

  // CRUD
  @Post('user/signup')
  create(@Body() createAppUserDto: any) {
    return this.appUserService.create(createAppUserDto);
  }

  @Post('user/signin')
  async loginApp(@Body() input: LoginByUsernameDto, @RealIP() ip: string) {
    try {
      return this.authService.loginAppViaUsername(input, ip);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AppAuthGuard)
  @Get('user/detail')
  findOne(@GetCurrentAppUser() user: PayLoad) {
    return this.appUserService.findOne(user['id']);
  }

  @UseGuards(AppAuthGuard)
  @Patch('user/update')
  update(
    @GetCurrentAppUser() user: PayLoad,
    @Body() updateAppUserDto: UpdateAppUserDto,
  ) {
    return this.appUserService.update(user.id, updateAppUserDto);
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

  @UseGuards(AppAuthGuard)
  @Patch('user/update-password')
  async updatePassword(
    @Body() dto: object,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.appUserService.updatePassword(userFromToken['id'], dto);
  }

  @UseGuards(AppAuthGuard)
  @Patch('user/update-withdrawal-password')
  async updateWithdrawalPassword(
    @Body() dto: object,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.appUserService.updateWithdrawalPassword(
      userFromToken['id'],
      dto,
    );
  }

  // User Account
  @UseGuards(AppAuthGuard)
  @Patch('account/freeze')
  async update_customer_is_freeze(@GetCurrentAppUser() customer: PayLoad) {
    return this.appUserService.freeze_account(customer['id']);
  }

  // @UseGuards(AppAuthGuard)
  // @Patch('account/profit')
  // async update_customer_profit(@GetCurrentAppUser() customer: PayLoad) {
  //   return this.appUserService.update_customer_profit(customer['id']);
  // }

  // @UseGuards(AppAuthGuard)
  // @Patch('account/hold-value')
  // async update_customer_hold_value(@GetCurrentAppUser() customer: PayLoad) {
  //   return this.appUserService.update_customer_hold_value(customer['id']);
  // }

  @UseGuards(AppAuthGuard)
  @Get('account/get-balance-frozen')
  async get_customer_balance_frozen(@GetCurrentAppUser() customer: PayLoad) {
    return this.appUserService.get_customer_balance_frozen(customer['id']);
  }

  // @UseGuards(AppAuthGuard)
  // @Patch('account/balance-avail')
  // async update_customer_balance_avail(
  //   @GetCurrentAppUser() customer: PayLoad,
  // ): Promise<any> {
  //   return this.appUserService.update_customer_balance_avail(customer['id']);
  // }

  // Deposit-Account
  @UseGuards(AppAuthGuard)
  @Get('deposit-account/list')
  findAllDepAccount() {
    return this.depositAccountService.findAll();
  }

  @UseGuards(AppAuthGuard)
  @Get('deposit-account/detail/:id')
  findOneDepAccount(@Param('id') id: string) {
    return this.depositAccountService.findOne(+id);
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

  @UseGuards(AppAuthGuard)
  @Get('deposit/detail/:id')
  async getDeposit(@Param(id) id: number) {
    return this.depositService.findOne(id);
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

  @UseGuards(AppAuthGuard)
  @Get('withdrawal/check-has-password')
  async checkWithdrawalPassword(@GetCurrentAppUser() userFromToken: PayLoad) {
    const user = await this.appUserService.findOne(userFromToken['id']);
    if (user['withdraw_password'].length > 0) {
      return true;
    }
    return false;
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
  @Get('transaction/list')
  async getTransactionsList(
    @Query() query: PaginationQuery,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.trxService.findAll(query, userFromToken['id']);
  }

  // Favorite
  @UseGuards(AppAuthGuard)
  @Get('favorite/list')
  async getFavoriteListStock(
    @Query() query: QueryFavorite,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    query['user_id'] = +userFromToken['id'];
    return this.favoriteStockService.get_list(query);
  }

  @UseGuards(AppAuthGuard)
  @Patch('favorite/like/:fs')
  async addFavoriteStock(
    @Param('fs') fs: string,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.favoriteStockService.create(userFromToken.id, fs);
  }

  @UseGuards(AppAuthGuard)
  @Patch('favorite/dislike/:fs')
  async removeFavoriteStock(
    @Param('fs') fs: string,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.favoriteStockService.remove(userFromToken.id, fs);
  }

  //Stock
  @UseGuards(AppAuthGuard)
  @Get('stock/list')
  async getStockList(
    @Query() query: QueryFavorite,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.stockService.findAll(query, userFromToken['id']);
  }

  @UseGuards(AppAuthGuard)
  @Get('stock/detail/:fs')
  async findDetailStock(
    @Param('fs') fs: string,
    @GetCurrentAppUser() user: PayLoad,
  ) {
    const stock = await this.stockService.findOne(fs);

    const today_count = await this.stockStorageService.count_today_purchased(
      user['id'],
      fs,
    );
    const total_count =
      await this.stockStorageService.count_list_stock_purchased(user['id'], fs);

    return {
      stock_data: stock,
      user_holding: {
        today_count,
        total_count,
      },
    };
  }

  @Get('stock/timeline')
  async get_k_line(
    @Query()
    query: {
      fromtick: string;
      period: string;
      psize: string;
      symbol: string;
    },
  ) {
    return this.stockService.get_k_line_data(query);
  }

  //List
  @UseGuards(AppAuthGuard)
  @Get('stock-storage/list')
  async findAllStock(
    @Query() query: PaginationQuery,
    @GetCurrentAppUser() user: PayLoad,
  ) {
    return this.stockStorageService.list_for_user(query, user.id);
  }

  //Trading Session
  @UseGuards(AppAuthGuard)
  @Get('trading-session/list')
  getTradingSessionList() {
    return this.tradingSessionService.findAll();
  }

  @UseGuards(AppAuthGuard)
  @Get('trading-session/detail/:id')
  getDetailTradingSession(@Param('id') id: string) {
    return this.tradingSessionService.findOne(id);
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
import { MESSAGE } from '../../common/constant';
import { AuthService } from '../../components/auth/auth.service';
import { LoginByUsernameDto } from '../../components/auth/dto/LoginByUsernameDto';
import { PayLoad } from '../../components/auth/dto/PayLoad';
import { GetCurrentAppUser } from '../../components/auth/guards/app-user.decorator';
import { AppAuthGuard } from '../../components/auth/guards/appAuth.guard';
import { BlockTransactionsService } from '../../components/block-transactions/block-transactions.service';
import { BlockTransactionQuery } from '../../components/block-transactions/dto/block-transaction-query.dto';
import { DepositAccountService } from '../../components/deposit-account/deposit-account.service';
import { DepositService } from '../../components/deposit/deposit.service';
import { CreateDepositDto } from '../../components/deposit/dto/create-deposit.dto';
import { DepositQuery } from '../../components/deposit/dto/query-deposit.dto';
import { QueryFavorite } from '../../components/favorite-stock/dto/query-favorite.dto';
import { FavoriteStockService } from '../../components/favorite-stock/favorite-stock.service';
import { IpoApplicationAssign } from '../../components/ipo-application/dto/create-ipo-application.dto';
import { IpoApplicationService } from '../../components/ipo-application/ipo-application.service';
import { IpoStockListQuery } from '../../components/ipo-stock/dto/ipo-stock-list-query.dto';
import { IpoStockService } from '../../components/ipo-stock/ipo-stock.service';
import { OrderQuery } from '../../components/order/dto/query-order.dto';
import { OrderService } from '../../components/order/order.service';
import { StockStorageService } from '../../components/stock-storage/stock-storage.service';
import { TradingSessionService } from '../../components/trading-session/trading-session.service';
import { TransactionsService } from '../../components/transactions/transactions.service';
import { CreateWithdrawDto } from '../../components/withdraw/dto/create-withdraw.dto';
import { WithdrawalQuery } from '../../components/withdraw/dto/query-withdrawal.dto';
import { WithdrawService } from '../../components/withdraw/withdraw.service';
import { PaginationQuery, UpdatePassword } from '../../helpers/dto-helper';
import LocalFilesInterceptor from '../../middleware/localFiles.interceptor';
import { AgentService } from '../agent/agent.service';
import { IpoApplicationListQuery } from './../../components/ipo-application/dto/ipo-application-query.dto';
import { AppUserService } from './app-user.service';
import { SellablePositionsQuery } from './dto/app-user-query.dto';
import { AppUserRegister } from './dto/create-app-user.dto';
import { AppUserUpdateProfile } from './dto/update-app-user.dto';

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
    private readonly agentService: AgentService,
    private readonly blockTrxService: BlockTransactionsService,
    private readonly ipoStockService: IpoStockService,
    private readonly ipoAppService: IpoApplicationService,
  ) {}

  // CRUD
  @Post('user/signup')
  create(@Body() body: AppUserRegister) {
    return this.appUserService.register(body);
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
    @Body() body: AppUserUpdateProfile,
  ) {
    return this.appUserService.updateProfile(user.id, body);
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
    @Body() dto: UpdatePassword,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.appUserService.updatePassword(userFromToken['id'], dto);
  }

  @UseGuards(AppAuthGuard)
  @Patch('user/update-withdrawal-password')
  async updateWithdrawalPassword(
    @Body() dto: UpdatePassword,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    return this.appUserService.updateWithdrawalPassword(
      userFromToken['id'],
      dto,
    );
  }

  // User Account
  // @UseGuards(AppAuthGuard)
  // @Patch('account/freeze')
  // async update_customer_is_freeze(@GetCurrentAppUser() customer: PayLoad) {
  //   return this.appUserService.freeze_account(customer['id']);
  // }

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
  async getDeposit(@Param('id') id: number) {
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
    return !!user['withdraw_password'];
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
    @Body() body: any,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    body['user_id'] = userFromToken['id'];
    return this.orderService.buy(body);
  }

  @UseGuards(AppAuthGuard)
  @Post('order/buy-block')
  async buyBigStock(
    @Body() body: any,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    body['user_id'] = userFromToken['id'];
    return this.orderService.buy(body, true);
  }

  @UseGuards(AppAuthGuard)
  @Get('order/positions')
  async getUserPosition(
    @Query() query: PaginationQuery,
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
  @Post('order/bulk-sell/:stock_code')
  async bulkSellStock(
    @Param('stock_code') stock_code: string,
    @GetCurrentAppUser() userFromToken: PayLoad,
    @Body() body: any,
  ) {
    const { position_ids } = body;
    if (!position_ids) {
      throw new BadRequestException('position_ids is required.');
    }
    return this.orderService.bulkSellNor(
      position_ids,
      stock_code,
      userFromToken['id'],
    );
  }

  @UseGuards(AppAuthGuard)
  @Get('order/positions-sellable')
  async getSellablePositions(
    @Query() query: SellablePositionsQuery,
    @GetCurrentAppUser() userFromToken: PayLoad,
  ) {
    if (!query.stock_code) {
      throw new BadRequestException(MESSAGE.BAD_REQUEST);
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

  //Block-transaction
  @UseGuards(AppAuthGuard)
  @Get('block-transaction/list')
  async getBlockTransactionsList(@Query() query: BlockTransactionQuery) {
    return this.blockTrxService.findAllByApp(query);
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

  // Ipo
  @UseGuards(AppAuthGuard)
  @Get('ipo-stock/list-available')
  async getAvailableIpoStock(@Query() query: IpoStockListQuery) {
    return this.ipoStockService.findAll(query, true);
  }

  @UseGuards(AppAuthGuard)
  @Get('ipo-application/list')
  async getIpoAppList(
    @Query() query: IpoApplicationListQuery,
    @GetCurrentAppUser() user: PayLoad,
  ) {
    return this.ipoAppService.findAll(query, user.id);
  }

  @UseGuards(AppAuthGuard)
  @Post('ipo-application/assign/:id')
  async assignIpoApp(
    @Param('id') id: number,
    @GetCurrentAppUser() user: PayLoad,
    @Body() body: IpoApplicationAssign,
  ) {
    body.user_id = user.id;
    body.ipo_id = id;
    return this.ipoAppService.assign(body);
  }

  @UseGuards(AppAuthGuard)
  @Patch('ipo-application/paid/:id')
  async paidIpoApp(
    @Param('id') id: number,
    @GetCurrentAppUser() user: PayLoad,
  ) {
    return this.ipoAppService.paidByApp(id, user.id);
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
  // @UseGuards(AppAuthGuard)
  // @Get('trading-session/list')
  // getTradingSessionList() {
  //   return this.tradingSessionService.findAll();
  // }

  // @UseGuards(AppAuthGuard)
  // @Get('trading-session/detail/:id')
  // getDetailTradingSession(@Param('id') id: string) {
  //   return this.tradingSessionService.findOne(id);
  // }

  @UseGuards(AppAuthGuard)
  @Get('trading-session/today')
  getDetailTradingSession() {
    return this.tradingSessionService.findToday();
  }

  // Agent
  @UseGuards(AppAuthGuard)
  @Get('agent/list')
  getAgentList(@Query() query: PaginationQuery) {
    return this.agentService.findAll(query);
  }
}

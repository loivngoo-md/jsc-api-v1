import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RealIP } from 'nestjs-real-ip';
import { AuthService } from '../../components/auth/auth.service';
import { LoginByUsernameDto } from '../../components/auth/dto/LoginByUsernameDto';
import { PayLoad } from '../../components/auth/dto/PayLoad';
import { GetCurrentCmsUser } from '../../components/auth/guards/cms-user.decorator';
import { CmsAuthGuard } from '../../components/auth/guards/cmsAuth.guard';
import { BlockTransactionQuery } from '../../components/block-transactions/dto/block-transaction-query.dto';
import { BlockTransactionUpdate } from '../../components/block-transactions/dto/update-block-transaction.dto';
import { DepositAccountService } from '../../components/deposit-account/deposit-account.service';
import { DepositService } from '../../components/deposit/deposit.service';
import { CreateDepositDto } from '../../components/deposit/dto/create-deposit.dto';
import { DepositQuery } from '../../components/deposit/dto/query-deposit.dto';
import { IpoApplicationCreate } from '../../components/ipo-application/dto/create-ipo-application.dto';
import { IpoApplicationListQuery } from '../../components/ipo-application/dto/ipo-application-query.dto';
import { IpoApplicationService } from '../../components/ipo-application/ipo-application.service';
import { IpoStockCreate } from '../../components/ipo-stock/dto/create-ipo-stock.dto';
import { IpoStockListQuery } from '../../components/ipo-stock/dto/ipo-stock-list-query.dto';
import { IpoStockUpdate } from '../../components/ipo-stock/dto/update-ipo-stock.dto';
import { LoginRecordService } from '../../components/login-record/login-record.service';
import { MoneyLogService } from '../../components/money-log/money-log.service';
import { OrderQuery } from '../../components/order/dto/query-order.dto';
import { OrderService } from '../../components/order/order.service';
import { StockService } from '../../components/stock/stock.service';
import { CreateSystemConfigurationDto } from '../../components/system-configuration/dto/create-system-configuration.dto';
import { UpdateSystemConfigurationDto } from '../../components/system-configuration/dto/update-system-configuration.dto';
import { SystemConfigurationService } from '../../components/system-configuration/system-configuration.service';
import { TradingSessionService } from '../../components/trading-session/trading-session.service';
import { TransactionsService } from '../../components/transactions/transactions.service';
import { CreateWithdrawDto } from '../../components/withdraw/dto/create-withdraw.dto';
import { WithdrawalQuery } from '../../components/withdraw/dto/query-withdrawal.dto';
import { WithdrawService } from '../../components/withdraw/withdraw.service';
import {
  PaginationQuery,
  SetPassword,
  UpdatePassword,
} from '../../helpers/dto-helper';
import { AgentService } from '../agent/agent.service';
import { AgentUserCreateByAdmin } from '../agent/dto/agent-user-create.dto';
import { AgentUserListQuery } from '../agent/dto/agent-user-query.dto';
import { AgentUserUpdate } from '../agent/dto/agent-user-update.dto';
import { AppUserService } from '../app-user/app-user.service';
import { AppUserListQuery } from '../app-user/dto/app-user-query.dto';
import { AppUserCreate } from '../app-user/dto/create-app-user.dto';
import { AppUserUpdateDetail } from '../app-user/dto/update-app-user.dto';
import { BlockTransactionsService } from './../../components/block-transactions/block-transactions.service';
import { BlockTransactionCreate } from './../../components/block-transactions/dto/create-block-transaction.dto';
import { IpoApplicationReview } from './../../components/ipo-application/dto/update-ipo-application.dto';
import { IpoStockService } from './../../components/ipo-stock/ipo-stock.service';
import { MoneyLogCreate } from './../../components/money-log/dto/money-log-create.dto';
import { CmsUserService } from './cms-user.service';
import { CmsUserListQuery } from './dto/cms-user-query.dto';
import { CreateCmsUserDto } from './dto/create-cms-user.dto';
import { UpdateCmsUserDto } from './dto/update-cms-user.dto';

@ApiTags('CMS')
@Controller('cms')
export class CmsUserController {
  constructor(
    private readonly cmsUserService: CmsUserService,
    private readonly appUserService: AppUserService,
    private readonly moneyLogService: MoneyLogService,
    private readonly authService: AuthService,
    private readonly orderService: OrderService,
    private readonly depositService: DepositService,
    private readonly withdrawalService: WithdrawService,
    private readonly loginRecordService: LoginRecordService,
    private readonly stockService: StockService,
    private readonly systemConfigurationService: SystemConfigurationService,
    private readonly tradingSessionService: TradingSessionService,
    private readonly depositAccountService: DepositAccountService,
    private readonly trxService: TransactionsService,
    private readonly agentService: AgentService,
    private readonly ipoStockService: IpoStockService,
    private readonly blockTrxService: BlockTransactionsService,
    private readonly ipoAppService: IpoApplicationService,
  ) {}
  @UseGuards(CmsAuthGuard)
  @Get('dashboard/detail')
  async getDashboard() {
    return this.cmsUserService.getDashboard();
  }

  // CMS - User
  @Post('user/signin')
  async signinCms(@Body() input: LoginByUsernameDto, @RealIP() ip: string) {
    return this.authService.loginCmsViaUsername(input, ip);
  }

  @UseGuards(CmsAuthGuard)
  @Get('user/detail')
  async getCurrentCmsInfo(@GetCurrentCmsUser() user: PayLoad) {
    const response = await this.cmsUserService.findByUsername(user.username);
    return response;
  }

  @UseGuards(CmsAuthGuard)
  @Patch('user/update')
  async update(
    @GetCurrentCmsUser() user: PayLoad,
    @Body() updateCmsUserDto: UpdateCmsUserDto,
  ) {
    return this.cmsUserService.update(user['id'], updateCmsUserDto);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('user/closed')
  async remove(@GetCurrentCmsUser() user: PayLoad) {
    return this.cmsUserService.update(user['id'], { is_active: false });
  }

  @UseGuards(CmsAuthGuard)
  @Patch('user/update-password')
  async updatePassword(
    @Body() body: UpdatePassword,
    @GetCurrentCmsUser() userFromToken: PayLoad,
  ) {
    return this.cmsUserService.updatePassword(userFromToken['id'], body);
  }

  // Cms - Users
  @UseGuards(CmsAuthGuard)
  @Get('cms-users/list')
  async cmsList(@Query() query: CmsUserListQuery) {
    return this.cmsUserService.findAll(query);
  }

  @UseGuards(CmsAuthGuard)
  @Post('cms-users/create')
  async signupCms(@Body() input: CreateCmsUserDto) {
    return this.cmsUserService.create(input);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('cms-users/lock/:id')
  async lockUserCms(@Param('id') id: number) {
    return this.cmsUserService.actionLockOnCms(id, true);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('cms-users/unlock/:id')
  async unlockUserCms(@Param('id') id: number) {
    return this.cmsUserService.actionLockOnCms(id, false);
  }

  //Agent - Users
  @UseGuards(CmsAuthGuard)
  @Get('agent-users/list')
  getAgentList(@Query() query: AgentUserListQuery) {
    return this.agentService.findAll(query);
  }

  @UseGuards(CmsAuthGuard)
  @Get('agent-users/detail/:id')
  getAgentDetail(@Param('id') id: number) {
    return this.agentService.findOne(id);
  }

  @UseGuards(CmsAuthGuard)
  @Post('agent-users/create')
  createAgent(@Body() dto: AgentUserCreateByAdmin) {
    return this.agentService.create(dto);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('agent-users/update/:id')
  updateAgent(@Param('id') id: number, @Body() dto: AgentUserUpdate) {
    return this.agentService.update(id, dto);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('agent-users/set-password/:id')
  setAgentPassword(@Param('id') id: number, @Body() dto: SetPassword) {
    return this.agentService.setPassword(id, dto);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('agent-users/remove/:id')
  removeAgent(@Param('id') id: number) {
    return this.agentService.remove(id);
  }

  // App - Users
  @UseGuards(CmsAuthGuard)
  @Get('app-users/list')
  findAllWithPagging(@Query() query: AppUserListQuery) {
    return this.appUserService.getList(query);
  }

  @UseGuards(CmsAuthGuard)
  @Get('app-users/detail/:id')
  getAAppUser(@Param('id') id: string) {
    return this.appUserService.findOne(+id);
  }

  @UseGuards(CmsAuthGuard)
  @Post('app-users/create')
  createNewAppUser(
    @Body() body: AppUserCreate,
    @GetCurrentCmsUser() cms: PayLoad,
  ) {
    return this.appUserService.create(body, cms);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('app-users/update/:id')
  updateAppUser(@Body() body: AppUserUpdateDetail, @Param('id') id: number) {
    return this.appUserService.updateAppUser(id, body);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('app-users/verified/:id')
  async verificationAppUserAccount(@Param('id') id: string) {
    return this.appUserService.verifiedAccount(+id);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('app-users/set-password/:user_id')
  async setPassword(
    @Param('user_id') user_id: number,
    @Body() body: SetPassword,
  ) {
    return this.appUserService.setPassword(user_id, body);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('app-users/set-withdrawal-password/:user_id')
  async setWithdrawalPassword(
    @Param('user_id') user_id: number,
    @Body() body: SetPassword,
  ) {
    return this.appUserService.setWithdrawalPassword(user_id, body);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('app-users/remove/:id')
  async removeAppUser(@Param('id') id: string) {
    return this.appUserService.remove(+id);
  }

  @UseGuards(CmsAuthGuard)
  @Post('app-users/modified-balance/:id')
  async modifiedAppUser(
    @Body()
    dto: MoneyLogCreate,
    @Param('id') id: string,
  ) {
    return this.appUserService.modifiedBalance(+id, dto);
  }

  // Order
  @UseGuards(CmsAuthGuard)
  @Get('order/list/histories')
  async listOrders(@Query() query: OrderQuery) {
    return this.orderService.listAllOrders(query);
  }

  @UseGuards(CmsAuthGuard)
  @Get('order/list/today')
  async listOrderToday(@Query() query: PaginationQuery) {
    query['user_id'];
    return this.orderService.listAllToday(query);
  }

  @UseGuards(CmsAuthGuard)
  @Get('order/detail/:id')
  async view_detail_order(@Param('id') id: string) {
    return this.orderService.viewDetailOrder(+id);
  }

  @UseGuards(CmsAuthGuard)
  @Post('order/buy')
  async buyStock(@Body() body: any) {
    return this.orderService.buy(body);
  }

  @UseGuards(CmsAuthGuard)
  @Post('order/sell/:position_id')
  async sellStock(@Param('position_id') position_id: string) {
    return this.orderService.sell(position_id);
  }

  // Transaction
  @UseGuards(CmsAuthGuard)
  @Get('transaction/list')
  async getTransactionsList(@Query() query: PaginationQuery) {
    return this.trxService.findAll(query);
  }

  // Deposit-Account
  @UseGuards(CmsAuthGuard)
  @Post('deposit-account/create')
  createDepAccount(@Body() createDepositAccountDto: any) {
    return this.depositAccountService.create(createDepositAccountDto);
  }

  @UseGuards(CmsAuthGuard)
  @Get('deposit-account/list')
  findAllDepAccount() {
    return this.depositAccountService.findAll();
  }

  @UseGuards(CmsAuthGuard)
  @Get('deposit-account/detail/:id')
  findOneDepAccount(@Param('id') id: string) {
    return this.depositAccountService.findOne(+id);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('deposit-account/update/:id')
  updateDepAccount(
    @Param('id') id: string,
    @Body() updateDepositAccountDto: any,
  ) {
    return this.depositAccountService.update(+id, updateDepositAccountDto);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('deposit-account/closed/:id')
  removeDepAccount(@Param('id') id: string) {
    return this.depositAccountService.update(+id, { is_enable: false });
  }

  // Deposit
  @UseGuards(CmsAuthGuard)
  @Get('deposit/list')
  async getAllDeposits(@Query() query: DepositQuery) {
    return this.depositService.findAll(query);
  }

  @UseGuards(CmsAuthGuard)
  @Get('deposit/detail/:deposit_id')
  async getDeposit(@Param('deposit_id') deposit_id: number) {
    return this.depositService.findOne(deposit_id);
  }

  @UseGuards(CmsAuthGuard)
  @Post('deposit/create')
  async createDeposit(@Body() dto: CreateDepositDto) {
    return this.depositService.create(dto);
  }

  @UseGuards(CmsAuthGuard)
  @Post('deposit/review/:deposit_id')
  async reviewDeposit(
    @Param('deposit_id') deposit_id: number,
    @Body() dto: any,
    @GetCurrentCmsUser() cms: PayLoad,
  ) {
    dto['reviewed_by'] = cms['username'];
    dto['reviewed_at'] = new Date().getTime();
    return this.depositService.reviewByCms(deposit_id, dto);
  }

  // Withdrawal
  @UseGuards(CmsAuthGuard)
  @Get('withdrawal/list')
  async getAllWithdrawals(@Query() query: WithdrawalQuery) {
    return this.withdrawalService.findAll(query);
  }

  @UseGuards(CmsAuthGuard)
  @Get('withdrawal/detail/:withdrawal_id')
  async getWithdrawal(@Param('withdrawal_id') withdrawal_id: number) {
    return this.withdrawalService.findOne(withdrawal_id);
  }

  @UseGuards(CmsAuthGuard)
  @Post('withdrawal/create')
  async createWithdrawal(@Body() dto: CreateWithdrawDto) {
    return this.withdrawalService.create(dto);
  }

  @UseGuards(CmsAuthGuard)
  @Post('withdrawal/review/:withdrawal_id')
  async reviewWithdrawal(
    @Param('withdrawal_id') withdrawal_id: number,
    @Body() dto: any,
    @GetCurrentCmsUser() cms: PayLoad,
  ) {
    dto['reviewed_by'] = cms['username'];
    dto['reviewed_at'] = new Date().getTime();
    return this.withdrawalService.reviewByCms(withdrawal_id, dto);
  }

  @UseGuards(CmsAuthGuard)
  @Get('login-record/list')
  async list() {
    return await this.loginRecordService.list();
  }

  //Stock
  @UseGuards(CmsAuthGuard)
  @Get('/stock/list')
  async getStockList(@Query() query: any) {
    return this.stockService.findAll(query);
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

  @UseGuards(CmsAuthGuard)
  @Get('stock/pull')
  pullLatestStock(@Query() query: any) {
    return this.stockService.pullLatestStock(query);
  }

  //Ipo - Stock
  @UseGuards(CmsAuthGuard)
  @Get('ipo-stock/list')
  async getIpoStockList(@Query() query: IpoStockListQuery) {
    return this.ipoStockService.findAll(query);
  }

  @UseGuards(CmsAuthGuard)
  @Get('ipo-stock/detail/:ipo_id')
  async getIpoStockDetail(@Param('ipo_id') ipo_id: number) {
    return this.ipoStockService.findOne(ipo_id);
  }

  @UseGuards(CmsAuthGuard)
  @Post('ipo-stock/create')
  async createIpoStock(@Body() body: IpoStockCreate) {
    return this.ipoStockService.create(body);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('ipo-stock/update/:ipo_id')
  async updateIpoStock(
    @Param('ipo_id') ipo_id: number,
    @Body() body: IpoStockUpdate,
  ) {
    return this.ipoStockService.update(ipo_id, body);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('ipo-stock/remove/:ipo_id')
  async removeIpoStock(@Param('ipo_id') ipo_id: number) {
    return this.ipoStockService.remove(ipo_id);
  }

  // // Ipo - application
  @UseGuards(CmsAuthGuard)
  @Get('ipo-application/list')
  async listIpoApp(@Query() query: IpoApplicationListQuery) {
    return this.ipoAppService.findAll(query);
  }

  @UseGuards(CmsAuthGuard)
  @Get('ipo-application/detail/:id')
  async detailIpoApp(@Param('id') id: number) {
    return this.ipoAppService.findOne(id);
  }

  @UseGuards(CmsAuthGuard)
  @Post('ipo-application/create')
  async createIpoApp(@Body() body: IpoApplicationCreate) {
    return this.ipoAppService.create(body);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('ipo-application/review/:id')
  async reviewIpoApp(
    @Body() body: IpoApplicationReview,
    @Param('id') id: number,
  ) {
    return this.ipoAppService.reviewByCms(id, body);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('ipo-application/transfer/:id')
  async transferIpoApp(@Param('id') id: number) {
    return this.ipoAppService.transferByCms(id);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('ipo-application/remove/:id')
  async removeIpoApp(@Param('id') id: number) {
    return this.ipoAppService.remove(id);
  }

  // Block - Trx
  @UseGuards(CmsAuthGuard)
  @Get('block-transaction/list')
  getListBlocktrx(@Query() query: BlockTransactionQuery) {
    return this.blockTrxService.findAll(query);
  }

  @UseGuards(CmsAuthGuard)
  @Get('block-transaction/detail/:id')
  getDetailBlocktrx(@Param('id') id: number) {
    return this.blockTrxService.findOne(id);
  }

  @UseGuards(CmsAuthGuard)
  @Post('block-transaction/create')
  createBlocktrx(@Body() body: BlockTransactionCreate) {
    return this.blockTrxService.create(body);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('block-transaction/update/:id')
  updateBlocktrx(
    @Param('id') id: number,
    @Body() body: BlockTransactionUpdate,
  ) {
    return this.blockTrxService.update(id, body);
  }

  @UseGuards(CmsAuthGuard)
  @Patch('block-transaction/remove/:id')
  removeBlocktrx(@Param('id') id: number) {
    return this.blockTrxService.remove(id);
  }

  //Systemconfig
  @UseGuards(CmsAuthGuard)
  @Post('system-config/create')
  createSystemConfig(
    @Body() createSystemConfigurationDto: CreateSystemConfigurationDto,
  ) {
    return this.systemConfigurationService.create(createSystemConfigurationDto);
  }

  @UseGuards(CmsAuthGuard)
  @Get('system-config/detail')
  findSystemConfig() {
    return this.systemConfigurationService.findOne();
  }

  @UseGuards(CmsAuthGuard)
  @Patch('system-config/update')
  updateSystemConfig(
    @Body() updateSystemConfigurationDto: UpdateSystemConfigurationDto,
  ) {
    return this.systemConfigurationService.update(updateSystemConfigurationDto);
  }

  //Trading Session
  @UseGuards(CmsAuthGuard)
  @Get('trading-session/list')
  getTradingSessionList() {
    return this.tradingSessionService.findAll();
  }

  @UseGuards(CmsAuthGuard)
  @Get('trading-session/detail/:id')
  getDetailTradingSession(@Param('id') id: string) {
    return this.tradingSessionService.findOne(id);
  }
}

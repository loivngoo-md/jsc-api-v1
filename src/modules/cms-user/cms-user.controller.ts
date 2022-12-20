import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { AuthService } from '../../components/auth/auth.service';
import { LoginByUsernameDto } from '../../components/auth/dto/LoginByUsernameDto';
import { PayLoad } from '../../components/auth/dto/PayLoad';
import { GetCurrentCmsUser } from '../../components/auth/guards/cms-user.decorator';
import { CmsAuthGuard } from '../../components/auth/guards/cmsAuth.guard';
import { DepositService } from '../../components/deposit/deposit.service';
import { CreateDepositDto } from '../../components/deposit/dto/create-deposit.dto';
import { DepositQuery } from '../../components/deposit/dto/query-deposit.dto';
import { MoneyLogService } from '../../components/money-log/money-log.service';
import { OrderService } from '../../components/order/order.service';
import { CreateWithdrawDto } from '../../components/withdraw/dto/create-withdraw.dto';
import { WithdrawalQuery } from '../../components/withdraw/dto/query-withdrawal.dto';
import { WithdrawService } from '../../components/withdraw/withdraw.service';
import { chinaDate } from '../../helpers/helper-date';
import { AppUserService } from '../app-user/app-user.service';
import { CreateAppUserDto } from '../app-user/dto/create-app-user.dto';
import { CmsUserService } from './cms-user.service';
import { CreateCmsUserDto } from './dto/create-cms-user.dto';
import { UpdateCmsUserDto } from './dto/update-cms-user.dto';

@Controller('cms')
export class CmsUserController {
  constructor(
    private readonly cmsUserService: CmsUserService,
    private readonly appUserService: AppUserService,
    private readonly moneyLogService: MoneyLogService,
    private readonly authService: AuthService,
    private readonly _orderService: OrderService,
    private readonly depositService: DepositService,
    private readonly withdrawalService: WithdrawService,
  ) {}

  @Post('login')
  async loginCms(@Body() input: LoginByUsernameDto, @RealIP() ip: string) {
    try {
      return this.authService.loginCmsViaUsername(input, ip);
    } catch (error) {
      throw error;
    }
  }

  @Post('app-users/verified/:id')
  verificationAppUserAccount(@Param('id') id: string) {
    return this.appUserService.verifiedAccount(+id);
  }

  @Post('app-users/modified-balance/:id')
  async modifiedAppUser(
    @Body()
    dto: {
      amount: number;
      type: number;
      comments: string;
      remark: string;
    },
    @Param('id') id: string,
  ) {
    const modified = await this.appUserService.modifiedBalance(+id, dto);
    return this.moneyLogService.insert(modified);
  }

  @Post('app-users')
  createNewAppUser(@Body() createAppUserDto: CreateAppUserDto) {
    return this.appUserService.create(createAppUserDto);
  }

  @Patch('app-users/:id')
  updateAppUser(
    @Body() updateAppUserDto: CreateAppUserDto,
    @Param('id') id: string,
  ) {
    return this.appUserService.update(+id, updateAppUserDto);
  }

  @Delete('app-users/:id')
  detroyAppUser(@Param('id') id: string) {
    return this.appUserService.update(+id, { is_active: false });
  }

  @Get('/app-users')
  findAllWithPagging(
    @Query() query: { page: number; limit: number; search?: string },
  ) {
    return this.appUserService.getAppUserWithPagging(query);
  }

  @Get('app-users/:id')
  getAAppUser(@Param('id') id: string) {
    return this.appUserService.findOne(+id);
  }

  @Post()
  create(@Body() createCmsUserDto: CreateCmsUserDto) {
    return this.cmsUserService.create(createCmsUserDto);
  }

  @Get()
  findAll() {
    return this.cmsUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cmsUserService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCmsUserDto: UpdateCmsUserDto) {
    return this.cmsUserService.update(+id, updateCmsUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appUserService.update(+id, { is_active: false });
  }

  // Order
  @Get('/orders/histories')
  async list_orders() {
    return this._orderService.list_all_orders();
  }

  @Get('/orders/today')
  async list_orders_by_user_from_today(@Body() dto: { user_id: number }) {
    return this._orderService.list_orders_today_for_user(dto['user_id']);
  }

  @Get('/orders/:id')
  async view_detail_order(@Param('id') id: string) {
    return this._orderService.view_detail_order(+id);
  }

  // Deposit
  @UseGuards(CmsAuthGuard)
  @Get('/deposit/list')
  async getAllDeposits(@Query() query: DepositQuery) {
    return this.depositService.findAll(query);
  }

  @UseGuards(CmsAuthGuard)
  @Get('/deposit/detail/:deposit_id')
  async getDeposit(@Param('deposit_id') deposit_id: number) {
    return this.depositService.findOne(deposit_id);
  }

  @UseGuards(CmsAuthGuard)
  @Post('/deposit/create')
  async createDeposit(@Body() dto: CreateDepositDto) {
    return this.depositService.create(dto);
  }

  @UseGuards(CmsAuthGuard)
  @Post('/deposit/review/:deposit_id')
  async reviewDeposit(
    @Param('deposit_id') deposit_id: number,
    @Body() dto: any,
    @GetCurrentCmsUser() cms: PayLoad,
  ) {
    dto['reviewed_by'] = cms['username'];
    dto['reviewed_at'] = new Date();
    return this.depositService.reviewByCms(deposit_id, dto);
  }

  // Withdrawal
  @UseGuards(CmsAuthGuard)
  @Get('/withdrawal/list')
  async getAllWithdrawals(@Query() query: WithdrawalQuery) {
    return this.withdrawalService.findAll(query);
  }

  @UseGuards(CmsAuthGuard)
  @Get('/withdrawal/detail/:withdrawal_id')
  async getWithdrawal(@Param('withdrawal_id') withdrawal_id: number) {
    return this.withdrawalService.findOne(withdrawal_id);
  }

  @UseGuards(CmsAuthGuard)
  @Post('/withdrawal/create')
  async createWithdrawal(@Body() dto: CreateWithdrawDto) {
    return this.withdrawalService.create(dto);
  }

  @UseGuards(CmsAuthGuard)
  @Post('/withdrawal/review/:withdrawal_id')
  async reviewWithdrawal(
    @Param('withdrawal_id') withdrawal_id: number,
    @Body() dto: any,
    @GetCurrentCmsUser() cms: PayLoad,
  ) {
    dto['reviewed_by'] = cms['username'];
    dto['reviewed_at'] = new Date();
    return this.withdrawalService.reviewByCms(withdrawal_id, dto);
  }
}

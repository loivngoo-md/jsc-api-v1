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
import { AuthService } from '../../components/auth/auth.service';
import { DepositService } from '../../components/deposit/deposit.service';
import { DepositQuery } from '../../components/deposit/dto/query-deposit.dto';
import { OrderQuery } from '../../components/order/dto/query-order.dto';
import { OrderService } from '../../components/order/order.service';
import { TransactionsService } from '../../components/transactions/transactions.service';
import { WithdrawalQuery } from '../../components/withdraw/dto/query-withdrawal.dto';
import { WithdrawService } from '../../components/withdraw/withdraw.service';
import { UpdatePassword } from '../../helpers/dto-helper';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { AppUserListQuery } from '../../modules/app-user/dto/app-user-query.dto';
import { AppUserCreateByAgent } from '../app-user/dto/create-app-user.dto';
import { LoginByUsernameDto } from './../../components/auth/dto/LoginByUsernameDto';
import { PayLoadAgent } from './../../components/auth/dto/PayLoad';
import { GetCurrentAgentUser } from './../../components/auth/guards/agent-user.decorator';
import { AgentAuthGuard } from './../../components/auth/guards/agentAuth.guard';
import { AgentService } from './agent.service';
import { AgentUserCreateByAgent } from './dto/agent-user-create.dto';
import { AgentUserListQuery } from './dto/agent-user-query.dto';

@ApiTags('AGENT')
@Controller('agent')
export class AgentUserController {
  constructor(
    private readonly agentUserService: AgentService,
    private readonly authService: AuthService,
    private readonly appUserService: AppUserService,
    private readonly depositService: DepositService,
    private readonly withdrawalService: WithdrawService,
    private readonly orderService: OrderService,
    private readonly trxService: TransactionsService,
  ) {}

  @Post('user/signin')
  async signinAgent(@Body() input: LoginByUsernameDto) {
    return await this.authService.loginAgentViaUsername(input);
  }

  @UseGuards(AgentAuthGuard)
  @Get('user/detail')
  async getCurrentAgentInfo(@GetCurrentAgentUser() user: PayLoadAgent) {
    return await this.agentUserService.findByUsername(user.username);
  }

  @UseGuards(AgentAuthGuard)
  @Patch('user/update')
  async updateCurrentAgentInfo(@GetCurrentAgentUser() user: PayLoadAgent) {
    return await this.agentUserService.findByUsername(user.username);
  }

  @UseGuards(AgentAuthGuard)
  @Patch('user/update-password')
  async updatePw(
    @GetCurrentAgentUser() user: PayLoadAgent,
    @Body() body: UpdatePassword,
  ) {
    return await this.agentUserService.updatePassword(user.id, body);
  }

  //Agent - Users
  @UseGuards(AgentAuthGuard)
  @Get('agent-users/list')
  getAgentList(
    @GetCurrentAgentUser() user: PayLoadAgent,
    @Query() query: AgentUserListQuery,
  ) {
    return this.agentUserService.findAll(query, user.id);
  }

  @UseGuards(AgentAuthGuard)
  @Get('agent-users/detail/:id')
  getAgentDetail(
    @GetCurrentAgentUser() user: PayLoadAgent,
    @Param('id') id: number,
  ) {
    return this.agentUserService.findOne(id, user.id);
  }

  @UseGuards(AgentAuthGuard)
  @Post('agent-users/create')
  createAgent(
    @GetCurrentAgentUser() user: PayLoadAgent,
    @Body() dto: AgentUserCreateByAgent,
  ) {
    return this.agentUserService.createByAgent(dto, user.id);
  }

  //App-Users
  @UseGuards(AgentAuthGuard)
  @Get('app-users/list')
  findAllWithPagging(
    @GetCurrentAgentUser() user: PayLoadAgent,
    @Query() query: AppUserListQuery,
  ) {
    return this.appUserService.getListByAgent(query, user.id);
  }

  @UseGuards(AgentAuthGuard)
  @Post('app-users/create')
  createAppUser(
    @Body() body: AppUserCreateByAgent,
    @GetCurrentAgentUser() user: PayLoadAgent,
  ) {
    return this.appUserService.createByAgent(body, user);
  }

  @UseGuards(AgentAuthGuard)
  @Get('app-users/detail/:id')
  getAppUserDetail(@Param('id') id: number) {
    return this.appUserService.findOne(id);
  }

  // Order
  @UseGuards(AgentAuthGuard)
  @Get('order/list/histories')
  getOrderList(
    @Query() query: OrderQuery,
    @GetCurrentAgentUser() user: PayLoadAgent,
  ) {
    return this.orderService.listAllOrders(query, undefined, user.path);
  }

  // Transactions
  @UseGuards(AgentAuthGuard)
  @Get('transaction/list')
  getTransactionsList(
    @Query() query: OrderQuery,
    @GetCurrentAgentUser() user: PayLoadAgent,
  ) {
    return this.trxService.findAll(query, undefined, user.path);
  }

  // Deposit
  @UseGuards(AgentAuthGuard)
  @Get('deposit/list')
  getDepositList(
    @Query() query: DepositQuery,
    @GetCurrentAgentUser() user: PayLoadAgent,
  ) {
    return this.depositService.findAll(query, undefined, user.path);
  }

  //Withdrawal
  @UseGuards(AgentAuthGuard)
  @Get('withdrawal/list')
  getWithdrawalList(
    @Query() query: WithdrawalQuery,
    @GetCurrentAgentUser() user: PayLoadAgent,
  ) {
    return this.withdrawalService.findAll(query, undefined, user.path);
  }
}

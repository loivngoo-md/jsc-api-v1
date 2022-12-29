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
import { UpdatePassword } from '../../helpers/dto-helper';
import { AppUserService } from '../../modules/app-user/app-user.service';
import { AppUserListQuery } from '../../modules/app-user/dto/app-user-query.dto';
import { LoginByUsernameDto } from '../auth/dto/LoginByUsernameDto';
import { PayLoad } from '../auth/dto/PayLoad';
import { GetCurrentAgentUser } from '../auth/guards/agent-user.decorator';
import { AgentAuthGuard } from '../auth/guards/agentAuth.guard';
import { AuthService } from './../auth/auth.service';
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
  ) {}

  @Post('user/signin')
  async signinAgent(@Body() input: LoginByUsernameDto) {
    return await this.authService.loginAgentViaUsername(input);
  }

  @UseGuards(AgentAuthGuard)
  @Get('user/detail')
  async getCurrentAgentInfo(@GetCurrentAgentUser() user: PayLoad) {
    return await this.agentUserService.findByUsername(user.username);
  }

  @UseGuards(AgentAuthGuard)
  @Patch('user/update')
  async updateCurrentAgentInfo(@GetCurrentAgentUser() user: PayLoad) {
    return await this.agentUserService.findByUsername(user.username);
  }

  @UseGuards(AgentAuthGuard)
  @Patch('user/update-password')
  async updatePw(
    @GetCurrentAgentUser() user: PayLoad,
    @Body() body: UpdatePassword,
  ) {
    return await this.agentUserService.updatePassword(user.id, body);
  }

  //Agent - Users
  @UseGuards(AgentAuthGuard)
  @Get('agent-users/list')
  getAgentList(
    @GetCurrentAgentUser() user: PayLoad,
    @Query() query: AgentUserListQuery,
  ) {
    return this.agentUserService.findAll(query, user.id);
  }

  @UseGuards(AgentAuthGuard)
  @Get('agent-users/detail/:id')
  getAgentDetail(
    @GetCurrentAgentUser() user: PayLoad,
    @Param('id') id: number,
  ) {
    return this.agentUserService.findOne(id, user.id);
  }

  @UseGuards(AgentAuthGuard)
  @Post('agent-users/create')
  createAgent(
    @GetCurrentAgentUser() user: PayLoad,
    @Body() dto: AgentUserCreateByAgent,
  ) {
    return this.agentUserService.createByAgent(dto, user.id);
  }

  //App-Users
  @UseGuards(AgentAuthGuard)
  @Get('app-users/list')
  findAllWithPagging(
    @GetCurrentAgentUser() user: PayLoad,
    @Query() query: AppUserListQuery,
  ) {
    return this.appUserService.getListByAgent(query, user.id);
  }
}

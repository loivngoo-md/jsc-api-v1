import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TradingSessionService } from './trading-session.service';
import { CreateTradingSessionDto } from './dto/create-trading-session.dto';
import { UpdateTradingSessionDto } from './dto/update-trading-session.dto';

@Controller('trading-session')
export class TradingSessionController {
  constructor(private readonly tradingSessionService: TradingSessionService) {}

  @Post()
  create(@Body() createTradingSessionDto: CreateTradingSessionDto) {
    return this.tradingSessionService.create(createTradingSessionDto);
  }

  @Get()
  findAll() {
    return this.tradingSessionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tradingSessionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTradingSessionDto: UpdateTradingSessionDto,
  ) {
    return this.tradingSessionService.update(id, updateTradingSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tradingSessionService.remove(+id);
  }
}

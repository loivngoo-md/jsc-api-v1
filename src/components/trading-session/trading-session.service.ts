import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTradingSessionDto } from './dto/create-trading-session.dto';
import { UpdateTradingSessionDto } from './dto/update-trading-session.dto';
import { TradingSession } from './entities/trading-session.entity';

@Injectable()
export class TradingSessionService {
  constructor(
    @InjectRepository(TradingSession)
    private readonly _tradingSession: Repository<TradingSession>,
  ) {}

  async create(dto: CreateTradingSessionDto) {
    const transaction = this._tradingSession.create(dto);
    await this._tradingSession.save(transaction);
    return 'This action adds a new tradingSession';
  }

  findAll() {
    return `This action returns all tradingSession`;
  }

  async findOne(id: string) {
    console.log(id);
    return this._tradingSession.findOne({ where: { id: id } });
  }

  async update(id: string, dto: UpdateTradingSessionDto) {
    await this._tradingSession.update({ id: id }, dto);
    return `This action updates a #${id} tradingSession`;
  }

  remove(id: number) {
    return `This action removes a #${id} tradingSession`;
  }
}

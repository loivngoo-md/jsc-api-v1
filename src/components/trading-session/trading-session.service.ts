import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule/dist';
import { InjectRepository } from '@nestjs/typeorm';
import { dateFormatter } from 'src/helpers/moment';
import { Repository } from 'typeorm';
import { DAYS_IN_WEEK, SESSION_STATUS } from '../../common/enums';
import { SystemConfigurationService } from '../system-configuration/system-configuration.service';
import { CreateTradingSessionDto } from './dto/create-trading-session.dto';
import { UpdateTradingSessionDto } from './dto/update-trading-session.dto';
import { TradingSession } from './entities/trading-session.entity';

@Injectable()
export class TradingSessionService {
  constructor(
    @InjectRepository(TradingSession)
    private readonly _tradingSessionRepo: Repository<TradingSession>,
    private readonly _systemConfigService: SystemConfigurationService,
  ) {}

  async create(dto: CreateTradingSessionDto) {
    const transaction = this._tradingSessionRepo.create(dto);
    await this._tradingSessionRepo.save(transaction);
    return 'This action adds a new tradingSession';
  }

  async createMany(dto: any[]) {
    const transaction = this._tradingSessionRepo.create(dto);
    console.log(dto, transaction);
    return this._tradingSessionRepo.save(transaction);
  }

  findAll() {
    return `This action returns all tradingSession`;
  }

  async findOne(id: string) {
    return this._tradingSessionRepo.findOne({ where: { id: id } });
  }

  async findOpeningSession() {
    return this._tradingSessionRepo.findOne({
      where: { status: SESSION_STATUS.OPENING },
    });
  }

  async update(id: string, dto: UpdateTradingSessionDto) {
    await this._tradingSessionRepo.update({ id: id }, dto);
    return `This action updates a #${id} tradingSession`;
  }

  remove(id: number) {
    return `This action removes a #${id} tradingSession`;
  }

  @Cron('*/30 * * * 1-5')
  async startSession() {
    const date = dateFormatter();
    const currentDate = date.format('MM/DD/YYYY');
    const session = await this._tradingSessionRepo.findOne({
      where: { date: currentDate },
    });
    if (!session) {
      const sessionInfo = this._tradingSessionRepo.create({
        date: currentDate,
        day_of_week: DAYS_IN_WEEK[date.day()],
      });
      await this._tradingSessionRepo.save(sessionInfo);
      return `Create trading session for ${currentDate} successful.`;
    }

    let status: SESSION_STATUS = session['status'];
    if (!session['detail']) {
      const systemConfig = await this._systemConfigService.findOne();
      const tradingHours = systemConfig['trading_hours'];
      await this._tradingSessionRepo.update(
        { id: session['id'] },
        {
          detail: systemConfig,
          mor_start_time: new Date(
            `${currentDate} ${tradingHours['nor_start_mor']} +8`,
          ),
          mor_end_time: new Date(
            `${currentDate} ${tradingHours['nor_end_mor']} +8`,
          ),
          aft_start_time: new Date(
            `${currentDate} ${tradingHours['nor_start_aft']} +8`,
          ),
          aft_end_time: new Date(
            `${currentDate} ${tradingHours['nor_end_aft']} +8`,
          ),
        },
      );
    } else {
      const morStart = dateFormatter(`${session['mor_start_time']}`);
      const morEnd = dateFormatter(`${session['mor_end_time']}`);
      const aftStart = dateFormatter(`${session['aft_start_time']}`);
      const aftEnd = dateFormatter(`${session['aft_end_time']}`);
      console.log(morStart <= date);
      if (morStart <= date && date < morEnd) {
        status = SESSION_STATUS.OPENING;
      } else if (morEnd <= date && date < aftStart) {
        status = SESSION_STATUS.PENDING;
      } else if (aftStart <= date && date < aftEnd) {
        status = SESSION_STATUS.OPENING;
      } else if (aftEnd <= date) {
        status = SESSION_STATUS.CLOSED;
      }
      await this._tradingSessionRepo.update(
        { id: session['id'] },
        { status: status },
      );
    }
  }
}

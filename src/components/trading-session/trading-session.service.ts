import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { dateFormatter } from 'src/helpers/moment';
import { Repository } from 'typeorm';
import { COMMON_STATUS } from '../../common/enums';
import { DAYS } from '../../helpers/helper-date';
import { ITradingHours } from '../system-configuration/entities/system-configuration.interface';
import { SystemConfigurationService } from '../system-configuration/system-configuration.service';
import { compareHours } from './../../helpers/helper-date';
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
    return this._tradingSessionRepo.save(transaction);
  }

  findAll() {
    return `This action returns all tradingSession`;
  }

  async findOne(id: string) {
    return this._tradingSessionRepo.findOne({ where: { id: id } });
  }

  async findOpeningSession(isLargeTrd?: boolean) {
    const whereConditions = isLargeTrd
      ? { status_lar: COMMON_STATUS.OPENING }
      : { status_nor: COMMON_STATUS.OPENING };
    return this._tradingSessionRepo.findOne({
      where: whereConditions,
    });
  }

  async update(id: string, dto: UpdateTradingSessionDto) {
    return this._tradingSessionRepo.update({ id: id }, dto);
  }

  async findToday() {
    const date = dateFormatter();
    const currentDate = date.format('MM/DD/YYYY');
    return await this._tradingSessionRepo.findOne({
      where: { date: currentDate },
    });
  }

  /**
   *  Remove comment below to excuting progress each CronJob
   */

  @Cron('*/01 * * * 1-5')
  async startSession() {
    const date = dateFormatter();
    const curDate = date.format('MM/DD/YYYY');
    const curHour = date.format('HH:mm:ss');
    const session = await this._tradingSessionRepo.findOne({
      where: { date: curDate },
    });
    if (!session) {
      let $query = `
      UPDATE "trading-session" SET 
      status_nor = '${COMMON_STATUS.CLOSED}',
      status_lar = '${COMMON_STATUS.CLOSED}'
      WHERE NOT (status_nor = '${COMMON_STATUS.CLOSED}') 
      OR NOT (status_lar = '${COMMON_STATUS.CLOSED}')
      `;

      await this._tradingSessionRepo.query($query);

      const sessionInfo = this._tradingSessionRepo.create({
        date: curDate,
        day_of_week: DAYS[date.day()],
      });

      await this._tradingSessionRepo.save(sessionInfo);
      return `Create trading session for ${curDate} successful.`;
    }

    if (!session['detail']) {
      const systemConfig = await this._systemConfigService.findOne();
      await this._tradingSessionRepo.update(
        { id: session['id'] },
        {
          detail: systemConfig,
        },
      );
    } else {
      let { status_lar, status_nor } = session;
      const detail = session.detail;
      const tdHour = detail.trading_hours as any as ITradingHours;

      if (
        compareHours(curHour, tdHour.nor_start_mor, tdHour.nor_end_mor) ||
        compareHours(curHour, tdHour.nor_start_aft, tdHour.nor_end_aft)
      ) {
        status_nor = COMMON_STATUS.OPENING;
      }
      if (compareHours(curHour, tdHour.nor_end_mor, tdHour.nor_start_aft)) {
        status_nor = COMMON_STATUS.PENDING;
      }
      if (compareHours(curHour, tdHour.nor_end_aft)) {
        status_nor = COMMON_STATUS.CLOSED;
      }

      if (
        compareHours(curHour, tdHour.large_start_mor, tdHour.large_end_mor) ||
        compareHours(curHour, tdHour.large_start_aft, tdHour.large_end_aft)
      ) {
        status_lar = COMMON_STATUS.OPENING;
      }
      if (compareHours(curHour, tdHour.large_end_mor, tdHour.large_start_aft)) {
        status_lar = COMMON_STATUS.PENDING;
      }
      if (compareHours(curHour, tdHour.large_end_aft)) {
        status_lar = COMMON_STATUS.CLOSED;
      }

      await this._tradingSessionRepo.update(
        { id: session['id'] },
        { status_lar, status_nor },
      );
    }
  }
}

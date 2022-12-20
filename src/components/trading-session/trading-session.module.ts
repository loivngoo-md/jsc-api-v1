import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfigurationModule } from '../system-configuration/system-configuration.module';
import { TradingSession } from './entities/trading-session.entity';
import { TradingSessionController } from './trading-session.controller';
import { TradingSessionService } from './trading-session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TradingSession]),
    ScheduleModule.forRoot(),
    SystemConfigurationModule,
  ],
  controllers: [TradingSessionController],
  providers: [TradingSessionService],
  exports: [TradingSessionService],
})
export class TradingSessionModule {}

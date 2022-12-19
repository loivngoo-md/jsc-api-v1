import { Module } from '@nestjs/common';
import { TradingSessionService } from './trading-session.service';
import { TradingSessionController } from './trading-session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingSession } from './entities/trading-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TradingSession])],
  controllers: [TradingSessionController],
  providers: [TradingSessionService],
  exports: [TradingSessionService],
})
export class TradingSessionModule {}

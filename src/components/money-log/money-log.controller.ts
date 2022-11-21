import { Controller } from '@nestjs/common';
import { MoneyLogService } from './money-log.service';

@Controller('money-log')
export class MoneyLogController {
  constructor(private readonly moneyLogService: MoneyLogService) {}
}

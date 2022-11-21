import { Test, TestingModule } from '@nestjs/testing';
import { MoneyLogService } from './money-log.service';

describe('MoneyLogService', () => {
  let service: MoneyLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoneyLogService],
    }).compile();

    service = module.get<MoneyLogService>(MoneyLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

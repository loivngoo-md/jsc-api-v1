import { Test, TestingModule } from '@nestjs/testing';
import { MoneyLogController } from './money-log.controller';
import { MoneyLogService } from './money-log.service';

describe('MoneyLogController', () => {
  let controller: MoneyLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoneyLogController],
      providers: [MoneyLogService],
    }).compile();

    controller = module.get<MoneyLogController>(MoneyLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { StockStorageController } from './stock-storage.controller';

describe('StockStorageController', () => {
  let controller: StockStorageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockStorageController],
    }).compile();

    controller = module.get<StockStorageController>(StockStorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

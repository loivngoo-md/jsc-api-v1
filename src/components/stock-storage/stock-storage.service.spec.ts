import { Test, TestingModule } from '@nestjs/testing';
import { StockStorageService } from './stock-storage.service';

describe('StockStorageService', () => {
  let service: StockStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockStorageService],
    }).compile();

    service = module.get<StockStorageService>(StockStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

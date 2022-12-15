import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteStockService } from './favorite-stock.service';

describe('FavoriteStockService', () => {
  let service: FavoriteStockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavoriteStockService],
    }).compile();

    service = module.get<FavoriteStockService>(FavoriteStockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

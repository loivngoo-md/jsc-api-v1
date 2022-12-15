import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteStockController } from './favorite-stock.controller';
import { FavoriteStockService } from './favorite-stock.service';

describe('FavoriteStockController', () => {
  let controller: FavoriteStockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteStockController],
      providers: [FavoriteStockService],
    }).compile();

    controller = module.get<FavoriteStockController>(FavoriteStockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

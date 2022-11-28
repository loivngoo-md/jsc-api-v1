import { Test, TestingModule } from '@nestjs/testing';
import { LocalFileController } from './local-file.controller';
import { LocalFileService } from './local-file.service';

describe('LocalFileController', () => {
  let controller: LocalFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalFileController],
      providers: [LocalFileService],
    }).compile();

    controller = module.get<LocalFileController>(LocalFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

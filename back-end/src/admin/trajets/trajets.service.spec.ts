import { Test, TestingModule } from '@nestjs/testing';
import { TrajetsService } from './trajets.service';

describe('TrajetsService', () => {
  let service: TrajetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrajetsService],
    }).compile();

    service = module.get<TrajetsService>(TrajetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

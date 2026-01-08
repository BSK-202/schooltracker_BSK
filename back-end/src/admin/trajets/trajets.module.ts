// src/admin/trajets/trajets.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrajetsController } from './trajets.controller';
import { TrajetsService } from './trajets.service';
import { Trajet } from './entities/trajet.entity';
import { Bus } from '../buses/entities/bus.entity';
import { TrajetStop } from './entities/trajet-stop.entity';
import { Stop } from '../stops/entities/stop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trajet, Bus,TrajetStop,Stop])
  ],
  controllers: [TrajetsController],
  providers: [TrajetsService],
  exports: [TrajetsService]
})
export class TrajetsModule {}
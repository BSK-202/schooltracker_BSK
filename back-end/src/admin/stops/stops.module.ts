// src/admin/stops/stops.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StopsController } from './stops.controller';
import { StopsService } from './stops.service';
import { Stop } from './entities/stop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stop]) // AJOUTER Bus ici
  ],
  controllers: [StopsController],
  providers: [StopsService]
})
export class StopsModule {}
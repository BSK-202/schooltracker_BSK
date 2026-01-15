// src/tracking/tracking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { Parent } from '../admin/parents/entities/parent.entity';
import { Student } from '../admin/students/entities/student.entity';
import { Bus } from '../admin/buses/entities/bus.entity';
import { School } from '../admin/schools/entities/school.entity';
import { Stop } from '../admin/stops/entities/stop.entity';
import { Trajet } from '../admin/trajets/entities/trajet.entity';
import { TrajetStop } from '../admin/trajets/entities/trajet-stop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Parent,
      Student,
      Bus,
      School,
      Stop,
      Trajet,
      TrajetStop,
    ]),
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
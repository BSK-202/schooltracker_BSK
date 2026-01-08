import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusesController } from './buses.controller';
import { BusesService } from './buses.service';
import { Bus } from './entities/bus.entity';
import { School } from '../schools/entities/school.entity';
import { Driver } from '../drivers/entities/driver.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bus, School, Driver])
  ],
  controllers: [BusesController],
  providers: [BusesService],
  exports: [BusesService]
})
export class BusesModule {}
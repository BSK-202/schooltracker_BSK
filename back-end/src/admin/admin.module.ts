import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SchoolsModule } from './schools/schools.module';
import { BusesModule } from './buses/buses.module';
import { DriversModule } from './drivers/drivers.module';
import { TrajetsModule } from './trajets/trajets.module';
import { StopsModule } from './stops/stops.module';
import { StudentsModule } from './students/students.module';
import { ParentsModule } from './parents/parents.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [SchoolsModule, BusesModule, DriversModule, TrajetsModule, StopsModule, StudentsModule, ParentsModule],
  exports: [SchoolsModule, BusesModule, DriversModule, TrajetsModule, StopsModule, StudentsModule, ParentsModule]
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';
import { School } from './entities/school.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from '../buses/entities/bus.entity';
import { Driver } from '../drivers/entities/driver.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([School,Bus,Driver])  // IMPORTANT: Ceci doit être présent
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService],
  exports: [SchoolsService]
})
export class SchoolsModule {}

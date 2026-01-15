// src/students/students.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { Parent } from '../parents/entities/parent.entity';
import { ParentsModule } from '../parents/parents.module';
import { Stop } from '../stops/entities/stop.entity';
import { Bus } from '../buses/entities/bus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Parent, Stop,Bus]),
    ParentsModule
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService]
})
export class StudentsModule {}
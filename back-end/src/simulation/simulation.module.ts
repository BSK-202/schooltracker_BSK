// src/simulation/simulation.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { SimulationGateway } from './simulation.gateway';
import { ParentsModule } from '../admin/parents/parents.module'; // AJOUTER (si existe)
import { StudentsModule } from '../admin/students/students.module'; // AJOUTER (si existe)
import { Parent } from '../admin/parents/entities/parent.entity'; // AJOUTER
import { Student } from '../admin/students/entities/student.entity'; // AJOUTER
import { NotificationsModule } from 'src/notifications/notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Parent,  // AJOUTER
      Student, // AJOUTER
    ]),
    forwardRef(() => NotificationsModule), // AJOUTER CETTE LIGNE
  ],
  providers: [
    SimulationService,
    SimulationGateway,
  ],
  exports: [SimulationService, SimulationGateway],
})
export class SimulationModule {}
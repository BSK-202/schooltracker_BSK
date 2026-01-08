import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { SchoolsModule } from './admin/schools/schools.module';
import { School } from './admin/schools/entities/school.entity';
import { BusesModule } from './admin/buses/buses.module';
import { Bus } from './admin/buses/entities/bus.entity';
import { Driver } from './admin/drivers/entities/driver.entity';
import { DriversModule } from './admin/drivers/drivers.module';
import { Trajet } from './admin/trajets/entities/trajet.entity';
import { TrajetsModule } from './admin/trajets/trajets.module';
import { Stop } from './admin/stops/entities/stop.entity';
import { StopsModule } from './admin/stops/stops.module';
import { TrajetStop } from './admin/trajets/entities/trajet-stop.entity';
import { Student } from './admin/students/entities/student.entity';
import { Parent } from './admin/parents/entities/parent.entity';
import { ParentsModule } from './admin/parents/parents.module';
import { StudentsModule } from './admin/students/students.module';

@Module({
  imports: [
     TypeOrmModule.forRoot({
       type: 'postgres',
       host: 'localhost',
       port: 5433,
       username: 'postgres',
       password: '5678',
       database: 'db_schoolTracker',
       entities: [User,School,Bus,Driver,Trajet,Stop,TrajetStop,Student,Parent],
       synchronize: true,
     }),AuthModule, UserModule, AdminModule,SchoolsModule,BusesModule,DriversModule,TrajetsModule,StopsModule,StudentsModule,ParentsModule],
     controllers: [AppController],
     providers: [AppService],
})
export class AppModule {}

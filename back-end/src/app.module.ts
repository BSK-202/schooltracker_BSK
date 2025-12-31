import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
     TypeOrmModule.forRoot({
       type: 'postgres',
       host: 'localhost',
       port: 5433,
       username: 'postgres',
       password: '5678',
       database: 'db_schoolTracker',
       entities: [User],
       synchronize: true,
     }),AuthModule, UserModule],
     controllers: [AppController],
     providers: [AppService],
})
export class AppModule {}

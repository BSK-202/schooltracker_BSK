// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Parent } from '../admin/parents/entities/parent.entity';
import { Driver } from '../admin/drivers/entities/driver.entity';
import { Bus } from 'src/admin/buses/entities/bus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parent, Driver,Bus]), // Ajoutez Admin si nécessaire
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'ACCESS_SECRET',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport'

@Module({
  imports: [
    JwtModule.register({
      secret: 'ACCESS_SECRET',
    }),

    PassportModule.register({ defaultStrategy: 'jwt' }),

  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule { }

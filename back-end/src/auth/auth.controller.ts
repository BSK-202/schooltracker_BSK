// src/auth/auth.controller.ts
import { 
  Body, 
  Controller, 
  Post, 
  Get, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  UsePipes,
  ValidationPipe 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * POST /auth/login
   * Authentification unique pour parent et driver
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/refresh
   * Rafraîchir le token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  /**
   * GET /auth/profile
   * Récupérer les informations du profil (protégé)
   */
  @UseGuards(AuthGuard('jwt'))
  @Get("profile")
  @HttpCode(HttpStatus.OK)
  info(@Request() req) {
    console.log("controller profile - User:", req.user);
    return this.authService.info(req.user);
  }

  /**
   * GET /auth/profil (alias pour compatibilité)
   */
  @UseGuards(AuthGuard('jwt'))
  @Get("profil")
  @HttpCode(HttpStatus.OK)
  profil(@Request() req) {
    console.log("controller profil - User:", req.user);
    return this.authService.info(req.user);
  }

  /**
   * GET /auth/me (autre alias)
   */
  @UseGuards(AuthGuard('jwt'))
  @Get("me")
  @HttpCode(HttpStatus.OK)
  me(@Request() req) {
    return this.authService.info(req.user);
  }
}
// src/tracking/tracking.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('tracking')
@UseGuards(AuthGuard('jwt'))
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  /**
   * GET /tracking/schools
   * Récupérer toutes les écoles des enfants du parent
   */
  @Get('schools')
  @HttpCode(HttpStatus.OK)
  async getSchools(@Request() req) {
    const { userId, role } = req.user;
    return this.trackingService.getChildSchools(userId, role);
  }

  /**
   * GET /tracking/children
   * Récupérer tous les enfants du parent avec infos basiques
   */
  @Get('children')
  @HttpCode(HttpStatus.OK)
  async getChildren(@Request() req) {
    const { userId, role } = req.user;
    return this.trackingService.getParentChildren(userId, role);
  }

  /**
   * GET /tracking/child/:childId
   * Récupérer les informations de tracking pour un enfant spécifique
   */
  @Get('child/:childId')
  @HttpCode(HttpStatus.OK)
  async getChildTracking(
    @Request() req,
    @Param('childId', ParseIntPipe) childId: number,
  ) {
    const { userId, role } = req.user;
    return this.trackingService.getChildTrackingInfo(userId, role, childId);
  }

  /**
   * GET /tracking/summary
   * Récupérer un résumé pour l'écran principal de tracking
   */
  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getTrackingSummary(@Request() req) {
    const { userId, role } = req.user;
    
    // Récupérer les écoles
    const schoolsResponse = await this.trackingService.getChildSchools(userId, role);
    
    // Récupérer les enfants
    const childrenResponse = await this.trackingService.getParentChildren(userId, role);
    
    return {
      message: 'Résumé de tracking récupéré avec succès',
      schools: schoolsResponse.schools,
      children: childrenResponse.children,
      summary: {
        totalSchools: schoolsResponse.totalSchools,
        totalChildren: childrenResponse.totalChildren,
        hasMultipleSchools: schoolsResponse.hasMultipleSchools,
        hasChildren: childrenResponse.hasChildren,
      },
    };
  }
}
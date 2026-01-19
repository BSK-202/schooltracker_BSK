// src/notifications/notifications.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  Delete, 
  UseGuards, 
  Request, 
  Get,
  Param,
  Put, 
  BadRequestException
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterTokenDto } from './dto/register-token.dto';
import { NotificationToken } from './entities/notification-token.entity';


@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

// MODIFIEZ CETTE PARTIE :
@ApiOperation({ summary: 'Enregistrer un token de notification' })
@UseGuards(AuthGuard('jwt'))
@Post('register-token')
async registerToken(
  @Request() req,
  @Body() body: RegisterTokenDto,
) {
  try {
    console.log('📨 Requête register-token reçue');
    console.log('👤 req.user COMPLET:', req.user); // Log complet
    
    // CORRECTION ICI : Utilisez req.user.userId au lieu de req.user.id
    if (!req.user || !req.user.userId) {
      console.error('❌ req.user invalide (pas de userId):', req.user);
      throw new BadRequestException('Utilisateur non authentifié');
    }

    // Affichez les bonnes infos
    console.log(`✅ Utilisateur authentifié:`, {
      userId: req.user.userId,
      phone: req.user.phone,
      role: req.user.role,
      fullName: req.user.full_name || req.user.fullName // Les deux possibles
    });
    
    console.log('🔑 Token reçu:', body.pushToken.substring(0, 20) + '...');
    
    // CORRECTION : Passez le userId au service
    const token = await this.notificationsService.registerToken(
      req.user.userId,  // <-- Passez userId directement
      body.pushToken
    );

    console.log('✅ Token enregistré avec succès');
    
    return {
      success: true,
      message: 'Token enregistré avec succès',
      token,
    };
  } catch (error) {
    console.error('❌ Erreur dans registerToken controller:', error.message);
    throw error;
  }
}

  @ApiOperation({ summary: 'Désenregistrer un token' })
  @UseGuards(AuthGuard('jwt'))
  @Delete('unregister-token')
  async unregisterToken(
    @Request() req,
    @Body() body: { pushToken: string },
  ) {
    await this.notificationsService.unregisterToken(body.pushToken);
    return { 
      success: true, 
      message: 'Token désenregistré' 
    };
  }

  @ApiOperation({ summary: 'Tester les notifications' })
  @UseGuards(AuthGuard('jwt'))
  @Post('test')
  async testNotification(@Request() req) {
    const parent = req.user;
    
    await this.notificationsService.sendToParent(
      parent.id,
      'Test Notification',
      'Ceci est une notification de test depuis SchoolTrack',
      { 
        test: true, 
        timestamp: new Date(),
        parentId: parent.id 
      },
    );
    
    return { 
      success: true, 
      message: 'Notification de test envoyée' 
    };
  }

  @ApiOperation({ summary: 'Vérifier les tokens actifs' })
  @UseGuards(AuthGuard('jwt'))
  @Get('tokens')
  async getTokens(@Request() req) {
    const parent = req.user;
    const tokens = await this.notificationsService.getParentTokens(parent.id);
    const hasActiveTokens = await this.notificationsService.hasActiveTokens(parent.id);
    
    return {
      success: true,
      data: {
        parentId: parent.id,
        hasActiveTokens,
        tokensCount: tokens.length,
        tokens,
      },
    };
  }

  @ApiOperation({ summary: 'Envoyer une notification spécifique' })
  @UseGuards(AuthGuard('jwt'))
  @Post('send/:parentId')
  async sendNotification(
    @Param('parentId') parentId: number,
    @Body() body: { 
      title: string; 
      body: string; 
      data?: any;
    },
  ) {
    const result = await this.notificationsService.sendToParent(
      parentId,
      body.title,
      body.body,
      body.data,
    );
    
    return {
      success: true,
      message: 'Notification envoyée',
      ticketsCount: result.length,
    };
  }

  @ApiOperation({ summary: 'Utiliser un template de notification' })
  @UseGuards(AuthGuard('jwt'))
  @Post('template/:template')
  async sendTemplateNotification(
    @Request() req,
    @Param('template') template: string,
    @Body() variables: any,
  ) {
    const parent = req.user;
    
    const result = await this.notificationsService.sendTemplateNotification(
      parent.id,
      template,
      variables,
    );
    
    return {
      success: true,
      message: `Notification template "${template}" envoyée`,
      ticketsCount: result.length,
    };
  }
}
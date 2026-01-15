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
  Put 
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

  @ApiOperation({ summary: 'Enregistrer un token de notification' })
  @UseGuards(AuthGuard('jwt'))
  @Post('register-token')
  async registerToken(
    @Request() req,
    @Body() body: RegisterTokenDto,
  ) {
    const parent = req.user;
    
    const token = await this.notificationsService.registerToken(
      parent,
      body.pushToken,
      body.deviceId,
      body.platform, // Déjà typé correctement
    );

    // Mettre à jour les infos supplémentaires si fournies
    if (body.appVersion || body.deviceModel || body.osVersion) {
      await this.notificationsService.updateTokenInfo(body.pushToken, {
        appVersion: body.appVersion,
        deviceModel: body.deviceModel,
        osVersion: body.osVersion,
      } as Partial<NotificationToken>);
    }

    return {
      success: true,
      message: 'Token enregistré avec succès',
      token,
    };
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
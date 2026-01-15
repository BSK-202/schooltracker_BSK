import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { NotificationToken } from './entities/notification-token.entity';
import { Parent } from '../admin/parents/entities/parent.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expo = new Expo();

  constructor(
    @InjectRepository(NotificationToken)
    private readonly tokenRepository: Repository<NotificationToken>,
  ) {}

  // 1. Enregistrer un token pour un parent
  async registerToken(parent: Parent, pushToken: string, deviceId: string, platform: 'ios' | 'android' | 'web') {
    // Vérifier si le token existe déjà
    const existingToken = await this.tokenRepository.findOne({
      where: { pushToken },
    });

    if (existingToken) {
      // Mettre à jour le parent et la date
      existingToken.parent = parent;
      existingToken.lastUsed = new Date();
      existingToken.isActive = true;
      return await this.tokenRepository.save(existingToken);
    }

    // Créer un nouveau token - CORRIGÉ : utiliser un objet partiel
    const notificationToken = this.tokenRepository.create({
      pushToken,
      deviceId,
      platform,
      parent,
      isActive: true,
      lastUsed: new Date(),
    } as Partial<NotificationToken>);

    return await this.tokenRepository.save(notificationToken);
  }

  // 2. Désenregistrer un token
  async unregisterToken(pushToken: string) {
    const token = await this.tokenRepository.findOne({
      where: { pushToken },
      relations: ['parent'],
    });

    if (token) {
      token.isActive = false;
      await this.tokenRepository.save(token);
      const parentId = token.parent?.id || 'inconnu';
      this.logger.log(`Token désactivé pour parent ${parentId}: ${pushToken}`);
    }
  }

  // 3. Envoyer une notification à un parent
  async sendToParent(parentId: number, title: string, body: string, data?: any): Promise<ExpoPushTicket[]> {
    const tokens = await this.tokenRepository.find({
      where: { 
        parent: { id: parentId },
        isActive: true,
      },
      relations: ['parent'],
    });

    if (tokens.length === 0) {
      this.logger.warn(`Aucun token actif pour le parent ${parentId}`);
      return [];
    }

    return await this.sendPushNotifications(
      tokens.map(t => t.pushToken),
      title,
      body,
      data
    );
  }

  // 4. Envoyer une notification à plusieurs parents
  async sendToParents(parentIds: number[], title: string, body: string, data?: any): Promise<ExpoPushTicket[]> {
    // CORRIGÉ : Utiliser In() pour les IDs multiples
    const tokens = await this.tokenRepository.find({
      where: { 
        parent: { id: In(parentIds) }, // CORRECTION ICI
        isActive: true,
      },
      relations: ['parent'],
    });

    if (tokens.length === 0) {
      this.logger.warn(`Aucun token actif pour les parents ${parentIds.join(', ')}`);
      return [];
    }

    return await this.sendPushNotifications(
      tokens.map(t => t.pushToken),
      title,
      body,
      data
    );
  }

  // 5. Envoyer une notification à plusieurs tokens
  async sendPushNotifications(
    pushTokens: string[],
    title: string,
    body: string,
    data?: any,
  ): Promise<ExpoPushTicket[]> {
    // Filtrer les tokens invalides
    const validTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));
    
    if (validTokens.length === 0) {
      this.logger.error('Aucun token valide');
      return [];
    }

    // Créer les messages
    const messages: ExpoPushMessage[] = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    try {
      // Envoyer par lots (Expo limite à 100 messages par lot)
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          this.logger.log(`Notifications envoyées: ${ticketChunk.length}`);
        } catch (error) {
          this.logger.error('Erreur envoi notifications:', error);
        }
      }

      return tickets;
    } catch (error) {
      this.logger.error('Erreur globale envoi notifications:', error);
      throw error;
    }
  }

  // 6. Notification pour le tracking du bus
  async sendBusTrackingNotification(parentId: number, busInfo: any): Promise<ExpoPushTicket[]> {
    const title = '🚌 Mise à jour du bus scolaire';
    const body = `Le bus ${busInfo.busNumber || busInfo.busId} est à ${busInfo.distance} de l'école`;
    
    const data = {
      screen: 'TrackingTab',
      busId: busInfo.busId,
      timestamp: new Date().toISOString(),
    };

    return await this.sendToParent(parentId, title, body, data);
  }

  // 7. Notification d'arrivée à l'arrêt
  async sendBusStopNotification(parentId: number, stopInfo: any): Promise<ExpoPushTicket[]> {
    const title = '🛑 Bus à l\'arrêt';
    const body = `Le bus est arrivé à ${stopInfo.stopName}`;
    
    const data = {
      screen: 'TrackingTab',
      busId: stopInfo.busId,
      stopId: stopInfo.stopId,
      type: 'stop',
    };

    return await this.sendToParent(parentId, title, body, data);
  }

  // 8. Notification d'arrivée à l'école
  async sendArrivalAtSchoolNotification(parentId: number): Promise<ExpoPushTicket[]> {
    const title = '🎉 Arrivée à l\'école';
    const body = 'Votre enfant est bien arrivé à l\'école';
    
    const data = {
      screen: 'TrackingTab',
      type: 'arrival',
    };

    return await this.sendToParent(parentId, title, body, data);
  }

  // 9. Notification de départ du bus
  async sendBusDepartureNotification(parentId: number, busInfo: any): Promise<ExpoPushTicket[]> {
    const title = '🚌 Départ du bus';
    const body = `Le bus ${busInfo.busNumber || busInfo.busId} vient de partir`;
    
    const data = {
      screen: 'TrackingTab',
      busId: busInfo.busId,
      type: 'departure',
    };

    return await this.sendToParent(parentId, title, body, data);
  }

  // 10. Notification de retard
  async sendDelayNotification(parentId: number, busInfo: any): Promise<ExpoPushTicket[]> {
    const title = '⏰ Retard du bus';
    const body = `Le bus ${busInfo.busNumber || busInfo.busId} a ${busInfo.delay} minutes de retard`;
    
    const data = {
      screen: 'TrackingTab',
      busId: busInfo.busId,
      type: 'delay',
      delay: busInfo.delay,
    };

    return await this.sendToParent(parentId, title, body, data);
  }

  // 11. Récupérer tous les tokens actifs d'un parent
  async getParentTokens(parentId: number): Promise<string[]> {
    const tokens = await this.tokenRepository.find({
      where: { 
        parent: { id: parentId },
        isActive: true,
      },
    });

    return tokens.map(token => token.pushToken);
  }

  // 12. Vérifier si un parent a des tokens actifs
  async hasActiveTokens(parentId: number): Promise<boolean> {
    const count = await this.tokenRepository.count({
      where: { 
        parent: { id: parentId },
        isActive: true,
      },
    });

    return count > 0;
  }

  // 13. Nettoyer les tokens inactifs (cron job)
  async cleanupInactiveTokens(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .where('isActive = :isActive', { isActive: false })
      .andWhere('lastUsed < :cutoffDate', { cutoffDate })
      .execute();

    const affected = result.affected || 0;
    this.logger.log(`Tokens inactifs nettoyés: ${affected}`);
    return affected;
  }

  // 14. Mettre à jour les infos d'un token
  async updateTokenInfo(pushToken: string, info: Partial<NotificationToken>) {
    const token = await this.tokenRepository.findOne({
      where: { pushToken },
    });

    if (token) {
      Object.assign(token, info);
      token.lastUsed = new Date();
      return await this.tokenRepository.save(token);
    }

    return null;
  }

  // 15. Notification générique avec template
  async sendTemplateNotification(parentId: number, template: string, variables: any = {}): Promise<ExpoPushTicket[]> {
    const templates = {
      WELCOME: {
        title: '👋 Bienvenue sur SchoolTrack!',
        body: 'Merci d\'avoir rejoint notre application de suivi scolaire.',
      },
      BUS_APPROACHING: {
        title: '🚌 Bus en approche',
        body: `Le bus ${variables.busNumber} est à ${variables.distance} de l'arrêt de ${variables.childName}`,
      },
      CHILD_BOARDED: {
        title: '✅ Enfant embarqué',
        body: `${variables.childName} a embarqué dans le bus ${variables.busNumber}`,
      },
      CHILD_DROPPED: {
        title: '🎒 Enfant déposé',
        body: `${variables.childName} est arrivé à l'école`,
      },
      EMERGENCY: {
        title: '🚨 Notification importante',
        body: variables.message || 'Une situation nécessite votre attention',
      },
    };

    const templateConfig = templates[template as keyof typeof templates];
    if (!templateConfig) {
      throw new Error(`Template "${template}" non trouvé`);
    }

    const data = {
      screen: 'NotificationDetail',
      template,
      ...variables,
      timestamp: new Date().toISOString(),
    };

    return await this.sendToParent(parentId, templateConfig.title, templateConfig.body, data);
  }
}
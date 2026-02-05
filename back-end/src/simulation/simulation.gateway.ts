import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, forwardRef,
  Inject, } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { NotificationsService } from '../notifications/notifications.service';
@WebSocketGateway({
  namespace: '/simulation',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class SimulationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SimulationGateway.name);
  private clientRooms = new Map<string, Set<number>>();

  constructor(
    @Inject(forwardRef(() => SimulationService))
    private readonly simulationService: SimulationService,
    
    private readonly notificationsService: NotificationsService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté: ${client.id}`);
    client.emit('connected', { 
      message: 'Connecté au serveur de simulation',
      timestamp: new Date(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté: ${client.id}`);
    this.clientRooms.delete(client.id);
  }

  

  /**
   * Un parent rejoint la room d'un bus
   */
  @SubscribeMessage('join-bus')
  handleJoinBus(
    @MessageBody() data: { busId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { busId } = data;
    const roomName = `bus-${busId}`;
    
    client.join(roomName);
    
    // Enregistrer le client
    if (!this.clientRooms.has(client.id)) {
      this.clientRooms.set(client.id, new Set());
    }
    
    const clientRoomSet = this.clientRooms.get(client.id);
    if (clientRoomSet) {
      clientRoomSet.add(busId);
    }
    
    this.logger.log(`Client ${client.id} rejoint ${roomName}`);
    
    // Envoyer la position actuelle si elle existe
    const currentPosition = this.simulationService.getBusPosition(busId);
    if (currentPosition) {
      client.emit('bus-position', {
        busId,
        ...currentPosition,
        type: 'current',
      });
    }
    
    // Envoyer le statut de la simulation
    const status = this.simulationService.getSimulationStatus(busId);
    if (status) {
      client.emit('simulation-status', status);
    }
    
    return { 
      success: true, 
      room: roomName, 
      busId,
      hasActiveSimulation: !!status?.isActive,
    };
  }

  /**
   * Le frontend envoie un trajet généré pour démarrer la simulation
   */
  @SubscribeMessage('start-simulation-with-route')
  async handleStartSimulationWithRoute(
    @MessageBody() data: {
      busId: number;
      trajetId: number;
      routePoints: Array<{ lat: number; lng: number }>;
      stops: Array<{
        stopId: number;
        lat: number;
        lng: number;
        order: number;
        isSchool: boolean;
        stopDuration?: number;
      }>;
      simulationSpeed?: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { busId, trajetId, routePoints, stops, simulationSpeed = 1 } = data;
    
    this.logger.log(`Démarrage simulation pour bus ${busId} avec ${routePoints.length} points`);
    
    // Démarrer la simulation
    const result = await this.simulationService.startSimulationWithRoute(
      busId,
      trajetId,
      routePoints,
      stops,
      simulationSpeed
    );
    
    if (result.success) {
      // Le client qui a démarré rejoint automatiquement
      client.join(`bus-${busId}`);
      
      // Enregistrer le client
      if (!this.clientRooms.has(client.id)) {
        this.clientRooms.set(client.id, new Set());
      }
      
      const clientRoomSet = this.clientRooms.get(client.id);
      if (clientRoomSet) {
        clientRoomSet.add(busId);
      }
    }
    
    return result;
  }

  /**
   * Arrêter la simulation
   */
  @SubscribeMessage('stop-simulation')
  handleStopSimulation(
    @MessageBody() data: { busId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { busId } = data;
    const result = this.simulationService.stopBusSimulation(busId);
    return result;
  }

  /**
   * Quitter une room
   */
  @SubscribeMessage('leave-bus')
  handleLeaveBus(
    @MessageBody() data: { busId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { busId } = data;
    const roomName = `bus-${busId}`;
    
    client.leave(roomName);
    
    const clientRoomSet = this.clientRooms.get(client.id);
    if (clientRoomSet) {
      clientRoomSet.delete(busId);
    }
    
    return { success: true, left: roomName };
  }

  /**
   * Récupérer le statut d'une simulation
   */
  @SubscribeMessage('get-simulation-status')
  handleGetSimulationStatus(
    @MessageBody() data: { busId: number },
  ) {
    const { busId } = data;
    const status = this.simulationService.getSimulationStatus(busId);
    return { 
      success: !!status, 
      status: status || null,
    };
  }

  /**
   * Récupérer toutes les simulations actives
   */
  @SubscribeMessage('get-active-simulations')
  handleGetActiveSimulations() {
    const simulations = this.simulationService.getActiveSimulations();
    return { success: true, simulations };
  }

  /**
   * Changer la vitesse de simulation
   */
  @SubscribeMessage('change-simulation-speed')
  handleChangeSimulationSpeed(
    @MessageBody() data: { busId: number; speedMultiplier: number },
  ) {
    const { busId, speedMultiplier } = data;
    const result = this.simulationService.changeSimulationSpeed(busId, speedMultiplier);
    
    if (result.success) {
      this.server.to(`bus-${busId}`).emit('simulation-speed-changed', {
        busId,
        speedMultiplier,
        message: result.message,
      });
    }
    
    return result;
  }

  /**
   * Pause/Reprendre la simulation
   */
  @SubscribeMessage('toggle-simulation-pause')
  handleToggleSimulationPause(
    @MessageBody() data: { busId: number },
  ) {
    const { busId } = data;
    const result = this.simulationService.toggleSimulationPause(busId);
    
    if (result.success) {
      this.server.to(`bus-${busId}`).emit('simulation-pause-toggled', {
        busId,
        isPaused: result.isPaused,
        message: result.message,
      });
    }
    
    return result;
  }

  /**
   * Méthodes de broadcast pour le service
   */
  broadcastPosition(busId: number, position: any) {
    this.server.to(`bus-${busId}`).emit('bus-position', {
      busId,
      ...position,
      type: 'update',
    });
  }

  broadcastStopEvent(busId: number, stopEvent: any) {
    this.server.to(`bus-${busId}`).emit('bus-stop', {
      busId,
      ...stopEvent,
      type: 'stop',
    });
  }

  broadcastCompletion(busId: number) {
    this.server.to(`bus-${busId}`).emit('bus-arrived', {
      busId,
      message: 'Bus arrivé à destination',
      type: 'arrival',
      timestamp: new Date(),
    });
  }

  broadcastSimulationStarted(busId: number, data: any) {
    this.server.to(`bus-${busId}`).emit('simulation-started', {
      busId,
      ...data,
      type: 'started',
      timestamp: new Date(),
    });
  }

  broadcastSimulationStopped(busId: number) {
    this.server.to(`bus-${busId}`).emit('simulation-stopped', {
      busId,
      message: 'Simulation arrêtée',
      type: 'stopped',
      timestamp: new Date(),
    });
  }
  broadcastParentNotification(busId: number, notificationData: any) {
  this.server.to(`bus-${busId}`).emit('parent-notification', {
    busId,
    timestamp: new Date(),
    ...notificationData,
  });
  
  this.logger.log(`Notification parent diffusée pour bus ${busId}: ${notificationData.type}`);
}


 broadcastScheduledNotification(notificationInfo: {
    busId: number;
    stopId: number;
    type: string;
    parentIds: number[];
    data: any;
  }): void {
    const { busId, type, parentIds, data } = notificationInfo;
    
    // 1. Diffuser aux clients WebSocket
    this.server.to(`bus-${busId}`).emit('scheduled-notification', {
      busId,
      type,
      ...data,
      timestamp: new Date(),
    });

    // 2. Envoyer les notifications push via le service de notifications
    this.sendPushNotifications(notificationInfo);
    
    this.logger.log(`Notification "${type}" diffusée pour bus ${busId} à ${parentIds.length} parent(s)`);
  }

   private async sendPushNotifications(notificationInfo: {
    busId: number;
    stopId: number;
    type: string;
    parentIds: number[];
    data: any;
  }): Promise<void> {
    try {
      const { busId, type, parentIds, data } = notificationInfo;
      
      // Titres selon le type
      const titles = {
        'departure': '🚌 Départ du bus',
        '5min_before': '🕐 Bus en approche',
        'on_time': '✅ Bus à l\'arrêt',
        'delay': '⏰ Retard du bus',
        'arrival': '🎉 Arrivée à l\'école',
      };

      const title = titles[type] || '📱 SchoolTrack';
      
      // Messages selon le type
      let message = '';
      switch (type) {
        case 'departure':
          message = `Le bus ${busId} vient de partir. Suivez son trajet en temps réel.`;
          break;
        case '5min_before':
          message = `Le bus sera à votre arrêt dans 5 minutes (prévu à ${data.scheduledTime})`;
          break;
        case 'on_time':
          message = data.isOnTime 
            ? `Le bus est à l'heure à votre arrêt (${data.scheduledTime})`
            : `Le bus est en retard de ${data.delayMinutes} minute(s) à votre arrêt`;
          break;
        case 'delay':
          message = `Le bus a ${data.delayMinutes} minutes de retard à votre arrêt (prévu à ${data.scheduledTime})`;
          break;
        case 'arrival':
          message = `Votre enfant est bien arrivé à l'école à ${data.arrivalTime}`;
          break;
        default:
          message = `Notification du bus ${busId}`;
      }

      // Données supplémentaires pour la navigation
      const notificationData = {
        screen: 'TrackingTab',
        busId,
        stopId: notificationInfo.stopId,
        type,
        ...data,
      };

      // Utiliser le service de notifications pour envoyer les push
      await this.notificationsService.sendToParents(
        parentIds,
        title,
        message,
        notificationData
      );

    } catch (error) {
      this.logger.error(`Erreur envoi notifications push:`, error);
    }
  }

  /**
   * Diffuser le statut temporel
   */
  broadcastTimeStatus(busId: number, timeStatus: any) {
    this.server.to(`bus-${busId}`).emit('time-status', {
      busId,
      ...timeStatus,
      timestamp: new Date(),
    });
  }
}
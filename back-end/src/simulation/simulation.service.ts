// src/simulation/simulation.service.ts
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SimulationGateway } from './simulation.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { Parent } from '../admin/parents/entities/parent.entity';
import { Student } from '../admin/students/entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrajetStop } from '../admin/trajets/entities/trajet-stop.entity';
import { Trajet } from '../admin/trajets/entities/trajet.entity';

interface ScheduledStop {
  stopId: number;
  scheduledTime: string;
  scheduledDateTime: Date;
  isCompleted: boolean;
  isSchool: boolean;
  notified5minBefore: boolean;
  notifiedMinutesAgo: number[]; // Minutes déjà notifiées
  notifiedArrival: boolean;
  notifiedImminent: boolean;
  actualArrival?: Date;
  delayMinutes?: number;
  estimatedArrivalTime?: Date;
  distance?: number;
}

interface BusSimulation {
  busId: number;
  trajetId: number;
  isActive: boolean;
  isPaused: boolean;
  pauseStartTime?: Date;
  accumulatedDelay: number;
  totalDelayMinutes: number;
  childStopId?: number;
  childName?: string;
  
  routePoints: Array<{
    lat: number;
    lng: number;
  }>;
  
  currentPointIndex: number;
  
  stops: Array<{
    stopId: number;
    lat: number;
    lng: number;
    order: number;
    isSchool: boolean;
    stopDuration: number;
    isCompleted: boolean;
  }>;
  
  currentPosition: {
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    timestamp: Date;
  };
  
  lastUpdate: Date;
  totalDistance: number;
  estimatedArrival?: Date;
  simulationSpeed: number;
  scheduledStops: ScheduledStop[];
  simulationStartTime: Date;
  currentSimulatedTime: Date;
  timeMultiplier: number;
  realTimeOffset: number;
}

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);
  
  private activeSimulations: Map<number, BusSimulation> = new Map();
  private simulationIntervals: Map<number, NodeJS.Timeout> = new Map();
  private timeCheckIntervals: Map<number, NodeJS.Timeout> = new Map();

  constructor(
    @Inject(forwardRef(() => SimulationGateway))
    private readonly simulationGateway: SimulationGateway,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(TrajetStop)
    private readonly trajetStopRepository: Repository<TrajetStop>,
    @InjectRepository(Trajet)
    private readonly trajetRepository: Repository<Trajet>,
  ) {}

  async startSimulationWithRoute(
    busId: number,
    trajetId: number,
    routePoints: Array<{ lat: number; lng: number }>,
    stops: Array<{
      stopId: number;
      lat: number;
      lng: number;
      order: number;
      isSchool: boolean;
      stopDuration?: number;
      childStopId?: number;
      childName?: string;
    }>,
    simulationSpeed: number = 1
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (this.activeSimulations.has(busId)) {
        const existing = this.activeSimulations.get(busId);
        if (existing?.isActive) {
          return { 
            success: false, 
            message: `Simulation déjà active pour le bus ${busId}` 
          };
        } else {
          this.stopSimulationInterval(busId);
          this.activeSimulations.delete(busId);
        }
      }

      if (routePoints.length === 0) {
        return { 
          success: false, 
          message: 'Trajet vide' 
        };
      }

      const trajet = await this.trajetRepository.findOne({
        where: { id: trajetId },
      });

      if (!trajet) {
        return {
          success: false,
          message: 'Trajet non trouvé',
        };
      }

      const trajetStops = await this.trajetStopRepository.find({
        where: { trajet: { id: trajetId } },
        relations: ['stop'],
        order: { stop_order: 'ASC' },
      });

      const scheduledStops: ScheduledStop[] = [];
      for (const trajetStop of trajetStops) {
        const stopInfo = stops.find(s => s.stopId === trajetStop.stop.id);
        if (stopInfo) {
          const scheduledDateTime = this.calculateScheduledDateTime(
            trajet.heure_debut,
            trajetStop.scheduled_time
          );

          scheduledStops.push({
            stopId: trajetStop.stop.id,
            scheduledTime: trajetStop.scheduled_time,
            scheduledDateTime,
            isCompleted: false,
            isSchool: stopInfo.isSchool,
            notified5minBefore: false,
            notifiedMinutesAgo: [],
            notifiedArrival: false,
            notifiedImminent: false,
            estimatedArrivalTime: undefined,
          });
        }
      }

      const totalDistance = this.calculateTotalDistance(routePoints);
      const sortedStops = [...stops].sort((a, b) => a.order - b.order);

      const childStop = stops.find(s => s.childStopId);

      const simulation: BusSimulation = {
        busId,
        trajetId,
        isActive: true,
        isPaused: false,
        pauseStartTime: undefined,
        accumulatedDelay: 0,
        totalDelayMinutes: 0,
        childStopId: childStop?.stopId,
        childName: childStop?.childName,
        routePoints,
        currentPointIndex: 0,
        stops: sortedStops.map(stop => ({
          ...stop,
          stopDuration: stop.stopDuration || 30,
          isCompleted: false,
        })),
        currentPosition: {
          lat: routePoints[0].lat,
          lng: routePoints[0].lng,
          speed: 0,
          heading: 0,
          timestamp: new Date(),
        },
        lastUpdate: new Date(),
        totalDistance,
        estimatedArrival: this.calculateEstimatedArrival(routePoints, simulationSpeed),
        simulationSpeed,
        scheduledStops,
        simulationStartTime: new Date(),
        currentSimulatedTime: new Date(),
        timeMultiplier: simulationSpeed,
        realTimeOffset: 0,
      };

      this.activeSimulations.set(busId, simulation);
      this.startSimulationInterval(busId, simulationSpeed);
      this.startTimeCheckInterval(busId);

      await this.handleDepartureNotification(busId, trajetId, simulation);
      this.logger.log(`Simulation démarrée pour bus ${busId}`);
      
      this.simulationGateway.broadcastSimulationStarted(busId, {
        message: 'Simulation démarrée',
        totalPoints: routePoints.length,
        totalStops: stops.length,
        simulationSpeed,
      });
      
      return { 
        success: true, 
        message: `Simulation démarrée pour le bus ${busId}`,
        data: {
          scheduledStops: scheduledStops.map(s => ({
            stopId: s.stopId,
            scheduledTime: s.scheduledTime,
            isSchool: s.isSchool,
          })),
        },
      };

    } catch (error) {
      this.logger.error(`Erreur démarrage simulation:`, error);
      return { success: false, message: `Erreur: ${error.message}` };
    }
  }

  private calculateScheduledDateTime(
    trajetStartTime: string,
    scheduledTime: string
  ): Date {
    const now = new Date();
    const [startHours, startMinutes, startSeconds] = trajetStartTime.split(':').map(Number);
    const [schedHours, schedMinutes, schedSeconds = 0] = scheduledTime.split(':').map(Number);
    
    const scheduledDate = new Date(now);
    scheduledDate.setHours(schedHours, schedMinutes, schedSeconds, 0);
    
    const startDateTime = new Date(now);
    startDateTime.setHours(startHours, startMinutes, startSeconds || 0, 0);
    
    if (scheduledDate < startDateTime) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    return scheduledDate;
  }

  private startTimeCheckInterval(busId: number): void {
    this.stopTimeCheckInterval(busId);

    const interval = setInterval(async () => {
      await this.checkScheduledTimes(busId);
    }, 30000); // Vérifier toutes les 30 secondes

    this.timeCheckIntervals.set(busId, interval);
  }

  private stopTimeCheckInterval(busId: number): void {
    const interval = this.timeCheckIntervals.get(busId);
    if (interval) {
      clearInterval(interval);
      this.timeCheckIntervals.delete(busId);
    }
  }

  private async checkScheduledTimes(busId: number): Promise<void> {
    const simulation = this.activeSimulations.get(busId);
    if (!simulation || !simulation.isActive || simulation.isPaused) return;

    const currentTime = new Date();
    
    const nextStop = simulation.scheduledStops.find(s => !s.isCompleted);
    if (!nextStop) return;

    const simStop = simulation.stops.find(s => s.stopId === nextStop.stopId);
    if (!simStop) return;

    const distanceToStop = this.calculateDistance(
      simulation.currentPosition.lat,
      simulation.currentPosition.lng,
      simStop.lat,
      simStop.lng
    );

    nextStop.distance = distanceToStop;

    const averageSpeedKmPerMin = 0.666;
    const estimatedMinutes = distanceToStop / averageSpeedKmPerMin;
    const adjustedMinutes = estimatedMinutes / simulation.simulationSpeed;
    const minutesToStop = Math.round(adjustedMinutes);

    nextStop.estimatedArrivalTime = new Date(
      currentTime.getTime() + (adjustedMinutes * 60000)
    );

    if (nextStop.stopId === simulation.childStopId && !nextStop.isCompleted) {
      await this.handleChildStopNotifications(
        busId,
        nextStop,
        minutesToStop,
        distanceToStop,
        simulation
      );
    }

    await this.handleGeneralStopNotifications(
      busId,
      nextStop,
      minutesToStop,
      distanceToStop,
      simulation
    );

    this.broadcastRealTimeStatus(busId, minutesToStop, nextStop);
  }

  private async handleChildStopNotifications(
    busId: number,
    nextStop: ScheduledStop,
    minutesToStop: number,
    distanceToStop: number,
    simulation: BusSimulation
  ): Promise<void> {
    try {
      if (minutesToStop <= 10 && minutesToStop > 0) {
        const shouldNotify = this.shouldNotifyChildStop(minutesToStop);
        
        if (shouldNotify && !nextStop.notifiedMinutesAgo.includes(minutesToStop)) {
          await this.triggerChildStopNotification(
            busId,
            nextStop,
            minutesToStop,
            'minutes_before',
            simulation
          );
          
          nextStop.notifiedMinutesAgo.push(minutesToStop);
        }
      }
      
      if (minutesToStop <= 5 && minutesToStop > 3 && !nextStop.notified5minBefore) {
        await this.triggerChildStopNotification(
          busId,
          nextStop,
          minutesToStop,
          '5min_before',
          simulation
        );
        nextStop.notified5minBefore = true;
      }
      
      if (distanceToStop < 0.02 && !nextStop.notifiedImminent) {
        await this.triggerChildStopNotification(
          busId,
          nextStop,
          minutesToStop,
          'imminent',
          simulation
        );
        nextStop.notifiedImminent = true;
      }
      
      if (distanceToStop < 0.005 && !nextStop.notifiedArrival) {
        await this.triggerChildStopNotification(
          busId,
          nextStop,
          0,
          'arrival',
          simulation
        );
        nextStop.notifiedArrival = true;
        nextStop.isCompleted = true;
      }
      
    } catch (error) {
      this.logger.error(`Erreur notifications arrêt enfant:`, error);
    }
  }

  private async triggerChildStopNotification(
    busId: number,
    stop: ScheduledStop,
    minutesToStop: number,
    type: string,
    simulation: BusSimulation
  ): Promise<void> {
    const messages = {
      minutes_before: {
        title: `👨‍👦 ${minutesToStop} min avant`,
        message: `Le bus sera à l'arrêt de ${simulation.childName || 'votre enfant'} dans ${minutesToStop} minute${minutesToStop > 1 ? 's' : ''}`,
      },
      '5min_before': {
        title: '🕐 Bus en approche',
        message: `Le bus sera à l'arrêt de ${simulation.childName || 'votre enfant'} dans 5 minutes`,
      },
      imminent: {
        title: '📍 Arrivée imminente',
        message: `Le bus arrive à l'arrêt de ${simulation.childName || 'votre enfant'}`,
      },
      arrival: {
        title: '✅ Arrivé à l\'arrêt',
        message: `Le bus est arrivé à l'arrêt de ${simulation.childName || 'votre enfant'}`,
      },
    };

    const config = messages[type as keyof typeof messages] || {
      title: '👨‍👦 Arrêt enfant',
      message: `Notification pour l'arrêt de ${simulation.childName || 'votre enfant'}`,
    };

    const parentIds = await this.getParentIdsForChildStop(busId, stop.stopId);
    
    if (parentIds.length === 0) {
      this.logger.warn(`⚠️ Aucun parent pour l'arrêt enfant ${stop.stopId}`);
      return;
    }

    const notificationInfo = {
      busId,
      stopId: stop.stopId,
      type: `child_${type}`,
      parentIds,
      data: {
        title: config.title,
        message: config.message,
        childName: simulation.childName,
        minutesToStop: type === 'arrival' ? 0 : minutesToStop,
        distance: stop.distance ? Math.round(stop.distance * 1000) : 0,
        isChildStop: true,
        timestamp: new Date().toISOString(),
      },
    };

    this.simulationGateway.broadcastScheduledNotification(notificationInfo);
    this.logger.log(`👨‍👦 Notification "${type}" pour arrêt enfant envoyée`);
  }

  private async handleGeneralStopNotifications(
    busId: number,
    nextStop: ScheduledStop,
    minutesToStop: number,
    distanceToStop: number,
    simulation: BusSimulation
  ): Promise<void> {
    if (nextStop.stopId === simulation.childStopId) return;

    if (minutesToStop <= 5 && minutesToStop > 3 && !nextStop.notified5minBefore) {
      const parentIds = await this.getParentIdsForBusAndStop(busId, nextStop.stopId);
      
      if (parentIds.length > 0) {
        const notificationInfo = {
          busId,
          stopId: nextStop.stopId,
          type: '5min_before_general',
          parentIds,
          data: {
            title: '🚌 Bus en approche',
            message: `Le bus sera à l'arrêt dans ${minutesToStop} minutes`,
            minutesToStop,
            isChildStop: false,
            timestamp: new Date().toISOString(),
          },
        };
        
        this.simulationGateway.broadcastScheduledNotification(notificationInfo);
        nextStop.notified5minBefore = true;
      }
    }
  }

  private shouldNotifyChildStop(minutesToStop: number): boolean {
    const notificationMinutes = [10, 7, 5, 3, 2, 1];
    return notificationMinutes.includes(minutesToStop);
  }

  private broadcastRealTimeStatus(busId: number, minutesToNextStop: number, nextStop: ScheduledStop): void {
    const simulation = this.activeSimulations.get(busId);
    if (!simulation) return;

    const status = {
      busId,
      nextStop: {
        stopId: nextStop.stopId,
        isSchool: nextStop.isSchool,
        scheduledTime: nextStop.scheduledTime,
        estimatedArrivalTime: nextStop.estimatedArrivalTime 
          ? this.formatTime(nextStop.estimatedArrivalTime)
          : null,
        minutesUntil: minutesToNextStop,
        isChildStop: nextStop.stopId === simulation.childStopId,
        delayMinutes: nextStop.delayMinutes || 0,
        childName: nextStop.stopId === simulation.childStopId ? simulation.childName : null,
      },
      currentPosition: simulation.currentPosition,
      isPaused: simulation.isPaused,
      simulationSpeed: simulation.simulationSpeed,
      timestamp: new Date(),
    };

    this.simulationGateway.broadcastTimeStatus(busId, status);
  }

  private formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0].substring(0, 5);
  }

  private async handleDepartureNotification(busId: number, trajetId: number, simulation: BusSimulation): Promise<void> {
    const parentIds = await this.getParentIdsForBus(busId);
    
    if (parentIds.length > 0) {
      const departureInfo = {
        busId,
        stopId: -1,
        trajetId,
        type: 'departure',
        parentIds,
        data: {
          startTime: simulation.simulationStartTime.toISOString(),
          scheduledStops: simulation.scheduledStops.map(s => ({
            stopId: s.stopId,
            scheduledTime: s.scheduledTime,
            isSchool: s.isSchool,
          })),
          timestamp: new Date().toISOString(),
        },
      };

      this.simulationGateway.broadcastScheduledNotification(departureInfo);
    }
  }

  private async getParentIdsForChildStop(busId: number, stopId: number): Promise<number[]> {
    try {
      const students = await this.studentRepository.find({
        where: {
          bus: { id: busId },
          stop: { id: stopId },
        },
        relations: ['parent1', 'parent2'],
      });
      
      const parentIds = new Set<number>();
      
      students.forEach(student => {
        if (student.parent1?.id) parentIds.add(student.parent1.id);
        if (student.parent2?.id) parentIds.add(student.parent2.id);
      });
      
      return Array.from(parentIds);
    } catch (error) {
      this.logger.error(`Erreur récupération parents arrêt enfant:`, error);
      return [];
    }
  }

  private async getParentIdsForBusAndStop(busId: number, stopId: number): Promise<number[]> {
    try {
      const parents = await this.parentRepository
        .createQueryBuilder('parent')
        .leftJoin('parent.studentsAsParent1', 'student1')
        .leftJoin('parent.studentsAsParent2', 'student2')
        .leftJoin('student1.bus', 'bus1')
        .leftJoin('student2.bus', 'bus2')
        .leftJoin('student1.stop', 'stop1')
        .leftJoin('student2.stop', 'stop2')
        .where('(bus1.id = :busId AND stop1.id = :stopId) OR (bus2.id = :busId AND stop2.id = :stopId)', {
          busId,
          stopId,
        })
        .getMany();
      
      return parents.map(parent => parent.id);
    } catch (error) {
      this.logger.error(`Erreur récupération parents bus/arrêt:`, error);
      return [];
    }
  }

  private startSimulationInterval(busId: number, speedMultiplier: number = 1): void {
    this.stopSimulationInterval(busId);

    const baseInterval = 2000;
    const adjustedInterval = baseInterval / speedMultiplier;
    
    const interval = setInterval(async () => {
      try {
        await this.updateBusPosition(busId);
      } catch (error) {
        this.logger.error(`❌ Erreur dans updateBusPosition:`, error);
      }
    }, adjustedInterval);

    this.simulationIntervals.set(busId, interval);
  }

  private async updateBusPosition(busId: number): Promise<void> {
    const simulation = this.activeSimulations.get(busId);
    if (!simulation || !simulation.isActive || simulation.isPaused) return;

    if (simulation.currentPointIndex >= simulation.routePoints.length - 1) {
      this.completeSimulation(busId);
      return;
    }

    const nextStop = simulation.stops.find(stop => !stop.isCompleted);
    if (nextStop) {
      const distanceToStop = this.calculateDistance(
        simulation.currentPosition.lat,
        simulation.currentPosition.lng,
        nextStop.lat,
        nextStop.lng
      );

      if (distanceToStop < 0.05) {
        this.handleStopArrival(busId, nextStop);
        return;
      }
    }

    const pointsToAdvance = Math.max(1, Math.floor(2 * simulation.simulationSpeed));
    simulation.currentPointIndex = Math.min(
      simulation.currentPointIndex + pointsToAdvance,
      simulation.routePoints.length - 1
    );

    const currentPoint = simulation.routePoints[simulation.currentPointIndex];
    const prevPointIndex = Math.max(0, simulation.currentPointIndex - pointsToAdvance);
    const prevPoint = simulation.routePoints[prevPointIndex];

    let speed = 40;
    if (nextStop) {
      const distanceToNextStop = this.calculateDistance(
        currentPoint.lat,
        currentPoint.lng,
        nextStop.lat,
        nextStop.lng
      );
      if (distanceToNextStop < 0.5) {
        speed = 20;
      }
    }

    speed = speed * simulation.simulationSpeed;

    const heading = this.calculateBearing(
      prevPoint.lat, prevPoint.lng,
      currentPoint.lat, currentPoint.lng
    );

    simulation.currentPosition = {
      lat: currentPoint.lat,
      lng: currentPoint.lng,
      speed,
      heading,
      timestamp: new Date(),
    };

    simulation.lastUpdate = new Date();
    this.activeSimulations.set(busId, simulation);
    this.broadcastBusPosition(busId, simulation.currentPosition);
  }

private async handleStopArrival(busId: number, stop: any): Promise<void> {
  const simulation = this.activeSimulations.get(busId);
  if (!simulation) return;

  this.logger.log(`Bus ${busId} arrivé à l'arrêt ${stop.stopId}`);
  
  // Vérifier si c'est l'arrêt enfant
  const isChildStop = stop.stopId === simulation.childStopId;
  
  const stopIndex = simulation.stops.findIndex(s => s.stopId === stop.stopId);
  if (stopIndex !== -1) {
    simulation.stops[stopIndex].isCompleted = true;
  }

  // Mettre à jour le scheduledStop correspondant
  const scheduledStop = simulation.scheduledStops.find(s => s.stopId === stop.stopId);
  if (scheduledStop) {
    scheduledStop.isCompleted = true;
    scheduledStop.actualArrival = new Date();
    
    // Calculer le retard
    if (scheduledStop.scheduledDateTime) {
      const delayMs = scheduledStop.actualArrival.getTime() - scheduledStop.scheduledDateTime.getTime();
      scheduledStop.delayMinutes = Math.round(delayMs / 60000);
    }
  }

  if (stop.stopId === -1) {
    this.logger.log(`Bus ${busId} arrivé à l'école`);
    this.completeSimulation(busId);
    return;
  }

  simulation.currentPosition.speed = 0;
  
  // Événement d'arrêt générique
  this.broadcastStopEvent(busId, {
    stopId: stop.stopId,
    isSchool: stop.isSchool,
    isChildStop: isChildStop, // AJOUTER CETTE PROPRIÉTÉ
    childName: isChildStop ? simulation.childName : null,
    duration: stop.stopDuration,
    timestamp: new Date(),
  });

  this.broadcastBusPosition(busId, simulation.currentPosition);

  // DIFFUSER UNE NOTIFICATION SPÉCIFIQUE POUR L'ARRIVÉE À L'ARRÊT ENFANT
  if (isChildStop) {
    this.logger.log(`🎉 Bus ${busId} arrivé à l'arrêt enfant de ${simulation.childName}`);
    
    // Trigger la notification d'arrivée enfant (si pas déjà fait)
    if (scheduledStop && !scheduledStop.notifiedArrival) {
      await this.triggerChildStopNotification(
        busId,
        scheduledStop,
        0,
        'arrival',
        simulation
      );
      scheduledStop.notifiedArrival = true;
    }
  }

  const adjustedDuration = (stop.stopDuration * 1000) / simulation.simulationSpeed;
  
  setTimeout(() => {
    const currentSimulation = this.activeSimulations.get(busId);
    if (currentSimulation?.isActive && !currentSimulation.isPaused) {
      this.logger.log(`Bus ${busId} repart de l'arrêt ${stop.stopId}`);
    }
  }, adjustedDuration);
}

  private async completeSimulation(busId: number): Promise<void> {
    const simulation = this.activeSimulations.get(busId);
    if (!simulation) return;

    this.logger.log(`Bus ${busId} arrivé à destination`);
    
    simulation.isActive = false;
    simulation.currentPosition.speed = 0;
    
    this.broadcastCompletion(busId);
    this.broadcastBusPosition(busId, simulation.currentPosition);
    
    setTimeout(() => {
      this.stopBusSimulation(busId);
    }, 5000);
  }

  private broadcastBusPosition(busId: number, position: any): void {
    this.simulationGateway.broadcastPosition(busId, position);
  }

  private broadcastStopEvent(busId: number, stopEvent: any): void {
    this.simulationGateway.broadcastStopEvent(busId, stopEvent);
  }

  private broadcastCompletion(busId: number): void {
    this.simulationGateway.broadcastCompletion(busId);
  }

  private broadcastSimulationStarted(busId: number, data: any): void {
    this.simulationGateway.broadcastSimulationStarted(busId, data);
  }

  private broadcastSimulationStopped(busId: number): void {
    this.simulationGateway.broadcastSimulationStopped(busId);
  }

  stopBusSimulation(busId: number): { success: boolean; message: string } {
    this.stopSimulationInterval(busId);
    this.stopTimeCheckInterval(busId);
    
    const simulation = this.activeSimulations.get(busId);
    if (simulation) {
      simulation.isActive = false;
      this.activeSimulations.delete(busId);
    }
    
    this.logger.log(`Simulation arrêtée pour le bus ${busId}`);
    this.broadcastSimulationStopped(busId);
    
    return { success: true, message: `Simulation arrêtée` };
  }

  private stopSimulationInterval(busId: number): void {
    const interval = this.simulationIntervals.get(busId);
    if (interval) {
      clearInterval(interval);
      this.simulationIntervals.delete(busId);
    }
  }

  changeSimulationSpeed(busId: number, speedMultiplier: number): { success: boolean; message: string } {
    const simulation = this.activeSimulations.get(busId);
    if (!simulation) {
      return { success: false, message: `Aucune simulation active pour le bus ${busId}` };
    }

    simulation.simulationSpeed = speedMultiplier;
    this.startSimulationInterval(busId, speedMultiplier);
    
    this.logger.log(`Vitesse changée à ${speedMultiplier}x pour bus ${busId}`);
    
    return { success: true, message: `Vitesse changée à ${speedMultiplier}x` };
  }

  toggleSimulationPause(busId: number): { success: boolean; message: string; isPaused: boolean } {
    const simulation = this.activeSimulations.get(busId);
    if (!simulation) {
      return { success: false, message: `Aucune simulation active`, isPaused: false };
    }

    const wasPaused = simulation.isPaused;
    simulation.isPaused = !simulation.isPaused;
    
    if (simulation.isPaused && !wasPaused) {
      simulation.pauseStartTime = new Date();
      this.stopSimulationInterval(busId);
      this.stopTimeCheckInterval(busId);
      simulation.currentPosition.speed = 0;
      this.broadcastBusPosition(busId, simulation.currentPosition);
      
      this.logger.log(`Pause démarrée pour bus ${busId}`);
      return { success: true, message: `Simulation mise en pause`, isPaused: true };
      
    } else if (!simulation.isPaused && wasPaused) {
      const pauseEndTime = new Date();
      const pauseDuration = pauseEndTime.getTime() - (simulation.pauseStartTime?.getTime() || pauseEndTime.getTime());
      const pauseMinutes = Math.round(pauseDuration / 60000);
      
      simulation.accumulatedDelay = (simulation.accumulatedDelay || 0) + pauseDuration;
      simulation.totalDelayMinutes = Math.round(simulation.accumulatedDelay / 60000);
      
      this.startSimulationInterval(busId, simulation.simulationSpeed);
      this.startTimeCheckInterval(busId);
      
      this.logger.log(`Pause terminée pour bus ${busId} - Retard: ${pauseMinutes} min`);
      return { success: true, message: `Simulation reprise`, isPaused: false };
    }
    
    return { success: false, message: 'Erreur inattendue', isPaused: simulation.isPaused };
  }

  private calculateTotalDistance(points: Array<{ lat: number; lng: number }>): number {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += this.calculateDistance(
        points[i-1].lat, points[i-1].lng,
        points[i].lat, points[i].lng
      );
    }
    return total;
  }

  private calculateEstimatedArrival(points: Array<{ lat: number; lng: number }>, speedMultiplier: number): Date {
    const totalDistance = this.calculateTotalDistance(points);
    const averageSpeed = 30;
    const hours = totalDistance / (averageSpeed * speedMultiplier);
    const arrival = new Date();
    arrival.setHours(arrival.getHours() + hours);
    return arrival;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const φ1 = this.toRad(lat1);
    const φ2 = this.toRad(lat2);
    const Δλ = this.toRad(lng2 - lng1);
    
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  getBusPosition(busId: number): any {
    const simulation = this.activeSimulations.get(busId);
    return simulation ? simulation.currentPosition : null;
  }

  getSimulationStatus(busId: number): any {
    const simulation = this.activeSimulations.get(busId);
    if (!simulation) return null;

    const nextStop = simulation.stops.find(stop => !stop.isCompleted);
    const completedStops = simulation.stops.filter(stop => stop.isCompleted).length;
    const progress = (simulation.currentPointIndex / simulation.routePoints.length) * 100;

    return {
      busId,
      isActive: simulation.isActive,
      isPaused: simulation.isPaused,
      currentPosition: simulation.currentPosition,
      progress: Math.round(progress),
      completedStops,
      nextStop,
      totalStops: simulation.stops.length,
      estimatedArrival: simulation.estimatedArrival,
      simulationSpeed: simulation.simulationSpeed,
    };
  }

  getActiveSimulations(): Array<any> {
    const result: any[] = [];
    for (const [busId, simulation] of this.activeSimulations) {
      result.push(this.getSimulationStatus(busId));
    }
    return result;
  }

  private async getParentsForBus(busId: number): Promise<Parent[]> {
    try {
      const parents = await this.parentRepository
        .createQueryBuilder('parent')
        .leftJoin('parent.studentsAsParent1', 'student1')
        .leftJoin('parent.studentsAsParent2', 'student2')
        .leftJoin('student1.bus', 'bus1')
        .leftJoin('student2.bus', 'bus2')
        .where('bus1.id = :busId OR bus2.id = :busId', { busId })
        .getMany();
      
      return parents;
    } catch (error) {
      this.logger.error(`Erreur récupération parents pour bus ${busId}:`, error);
      return [];
    }
  }

  private async getParentIdsForBus(busId: number): Promise<number[]> {
    const parents = await this.getParentsForBus(busId);
    return parents.map(parent => parent.id);
  }

  getScheduleStatus(busId: number): any {
    const simulation = this.activeSimulations.get(busId);
    if (!simulation) return null;

    return {
      busId,
      trajetId: simulation.trajetId,
      simulationStartTime: simulation.simulationStartTime,
      currentSimulatedTime: simulation.currentSimulatedTime,
      timeMultiplier: simulation.timeMultiplier,
      scheduledStops: simulation.scheduledStops.map(stop => ({
        stopId: stop.stopId,
        scheduledTime: stop.scheduledTime,
        isCompleted: stop.isCompleted,
        isSchool: stop.isSchool,
        notified5minBefore: stop.notified5minBefore,
        delayMinutes: stop.delayMinutes || 0,
        actualArrival: stop.actualArrival,
      })),
    };
  }
}
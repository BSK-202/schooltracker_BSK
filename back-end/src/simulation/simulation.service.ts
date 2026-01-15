// src/simulation/simulation.service.ts
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { SimulationGateway } from './simulation.gateway';
import { NotificationsService } from '../notifications/notifications.service'; // AJOUTER
import { Parent } from '../admin/parents/entities/parent.entity'; // AJOUTER
import { Student } from '../admin/students/entities/student.entity'; // AJOUTER
import { Bus } from '../admin/buses/entities/bus.entity'; // AJOUTER (si existe)
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface BusSimulation {
  busId: number;
  trajetId: number;
  isActive: boolean;
  
  // Le trajet généré par le frontend
  routePoints: Array<{
    lat: number;
    lng: number;
  }>;
  
  // Index actuel dans le trajet
  currentPointIndex: number;
  
  // Les arrêts avec leurs ordres
  stops: Array<{
    stopId: number;
    lat: number;
    lng: number;
    order: number;
    isSchool: boolean;
    stopDuration: number;
    isCompleted: boolean;
  }>;
  
  // Position actuelle
  currentPosition: {
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    timestamp: Date;
  };
  
  // État
  lastUpdate: Date;
  totalDistance: number;
  estimatedArrival?: Date;
  simulationSpeed: number; // AJOUT: Vitesse de simulation
  isPaused: boolean; // AJOUT: État de pause
}

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);
  
  // Stockage en mémoire des simulations
  private activeSimulations: Map<number, BusSimulation> = new Map();
  private simulationIntervals: Map<number, NodeJS.Timeout> = new Map();

  constructor(
    @Inject(forwardRef(() => SimulationGateway))
    private readonly simulationGateway: SimulationGateway,
      private readonly notificationsService: NotificationsService, // AJOUTER
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>, // AJOUTER
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>, // AJOUTER
  ) {}

  /**
   * Démarrer une simulation avec un trajet pré-généré
   */
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
    }>,
    simulationSpeed: number = 1 // AJOUT: Paramètre de vitesse
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier si une simulation existe déjà
      if (this.activeSimulations.has(busId)) {
        const existing = this.activeSimulations.get(busId);
        if (existing?.isActive) {
          return { 
            success: false, 
            message: `Simulation déjà active pour le bus ${busId}` 
          };
        } else {
          // Nettoyer l'ancienne simulation
          this.stopSimulationInterval(busId);
          this.activeSimulations.delete(busId);
        }
      }

      if (routePoints.length === 0) {
        return { 
          success: false, 
          message: 'Trajet vide, impossible de démarrer la simulation' 
        };
      }

      // Calculer la distance totale (approximative)
      const totalDistance = this.calculateTotalDistance(routePoints);

      // Organiser les arrêts par ordre
      const sortedStops = [...stops].sort((a, b) => a.order - b.order);

      // Créer la simulation
      const simulation: BusSimulation = {
        busId,
        trajetId,
        isActive: true,
        isPaused: false, // AJOUT
        routePoints,
        currentPointIndex: 0,
        stops: sortedStops.map(stop => ({
          ...stop,
          stopDuration: stop.stopDuration || 30, // 30 secondes par défaut
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
        simulationSpeed, // AJOUT
      };

      // Sauvegarder
      this.activeSimulations.set(busId, simulation);

      // Démarrer la mise à jour
      this.startSimulationInterval(busId, simulationSpeed);

      this.logger.log(`Simulation démarrée pour le bus ${busId} avec ${routePoints.length} points, vitesse: ${simulationSpeed}x`);
      
      // Informer via WebSocket
      this.simulationGateway.broadcastSimulationStarted(busId, {
        message: 'Simulation démarrée',
        totalPoints: routePoints.length,
        totalStops: stops.length,
        simulationSpeed,
      });
      
      return { 
        success: true, 
        message: `Simulation démarrée pour le bus ${busId}` 
      };

    } catch (error) {
      this.logger.error(`Erreur démarrage simulation:`, error);
      return { success: false, message: `Erreur: ${error.message}` };
    }
  }

  /**
   * Démarrer l'intervalle de simulation
   */
private startSimulationInterval(busId: number, speedMultiplier: number = 1): void {
  // Arrêter l'intervalle existant
  this.stopSimulationInterval(busId);

  // Démarrer un nouvel intervalle (ajusté selon la vitesse)
  const baseInterval = 2000; // 2 secondes de base
  const adjustedInterval = baseInterval / speedMultiplier;
  
  const interval = setInterval(async () => { // AJOUTER async ici
    try {
      await this.updateBusPosition(busId);
    } catch (error) {
      this.logger.error(`❌ Erreur dans updateBusPosition:`, error);
    }
  }, adjustedInterval);

  this.simulationIntervals.set(busId, interval);
}

/**
 * Mettre à jour la position du bus - MODIFIER CETTE MÉTHODE EXISTANTE
 */
private async updateBusPosition(busId: number): Promise<void> {
  const simulation = this.activeSimulations.get(busId);
  if (!simulation || !simulation.isActive || simulation.isPaused) return;

  // Vérifier si on est arrivé à la fin
  if (simulation.currentPointIndex >= simulation.routePoints.length - 1) {
    this.completeSimulation(busId);
    return;
  }

  // Vérifier si on approche d'un arrêt (votre code existant)
  const nextStop = simulation.stops.find(stop => !stop.isCompleted);
  if (nextStop) {
    const distanceToStop = this.calculateDistance(
      simulation.currentPosition.lat,
      simulation.currentPosition.lng,
      nextStop.lat,
      nextStop.lng
    );

    // Si on est à moins de 50m d'un arrêt
    if (distanceToStop < 0.05) {
      this.handleStopArrival(busId, nextStop);
      return;
    }
  }

  // Avancer sur le trajet (votre code existant)
  const pointsToAdvance = Math.max(1, Math.floor(2 * simulation.simulationSpeed));
  simulation.currentPointIndex = Math.min(
    simulation.currentPointIndex + pointsToAdvance,
    simulation.routePoints.length - 1
  );

  const currentPoint = simulation.routePoints[simulation.currentPointIndex];
  const prevPointIndex = Math.max(0, simulation.currentPointIndex - pointsToAdvance);
  const prevPoint = simulation.routePoints[prevPointIndex];

  // Calculer la vitesse (votre code existant)
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

  // Ajuster la vitesse selon le multiplicateur
  speed = speed * simulation.simulationSpeed;

  // Calculer la direction
  const heading = this.calculateBearing(
    prevPoint.lat, prevPoint.lng,
    currentPoint.lat, currentPoint.lng
  );

  // Mettre à jour la position
  simulation.currentPosition = {
    lat: currentPoint.lat,
    lng: currentPoint.lng,
    speed,
    heading,
    timestamp: new Date(),
  };

  simulation.lastUpdate = new Date();

  // Sauvegarder
  this.activeSimulations.set(busId, simulation);

  // Diffuser la position
  this.broadcastBusPosition(busId, simulation.currentPosition);

  // AJOUTER : NOTIFICATION POUR LE DÉPART (première position)
  if (simulation.currentPointIndex === 1) { // Après le premier mouvement
    await this.notifyBusParents(
      busId,
      'departure',
      `Le bus ${busId} vient de partir`,
      {
        from: 'départ',
        initialSpeed: speed,
      }
    );
  }

  // AJOUTER : NOTIFICATION SI BUS PROCHE DE L'ÉCOLE
  // Vous devez définir la position de l'école
  const schoolPosition = { lat: 33.6746935, lng: -7.419312 }; // À adapter
  const distanceToSchool = this.calculateDistance(
    currentPoint.lat,
    currentPoint.lng,
    schoolPosition.lat,
    schoolPosition.lng
  );
  
  if (distanceToSchool < 0.5) { // 500 mètres
    await this.notifyBusParents(
      busId,
      'approaching',
      `Le bus est à ${Math.round(distanceToSchool * 1000)}m de l'école`,
      {
        distance: Math.round(distanceToSchool * 1000),
        unit: 'mètres',
      }
    );
  }
}

  /**
   * Gérer l'arrivée à un arrêt
   */
/**
 * Gérer l'arrivée à un arrêt - MODIFIER CETTE MÉTHODE EXISTANTE
 */
private async handleStopArrival(busId: number, stop: any): Promise<void> {
  const simulation = this.activeSimulations.get(busId);
  if (!simulation) return;

  this.logger.log(`Bus ${busId} arrivé à l'arrêt ${stop.stopId}`);
  
  // Marquer l'arrêt comme complété
  const stopIndex = simulation.stops.findIndex(s => s.stopId === stop.stopId);
  if (stopIndex !== -1) {
    simulation.stops[stopIndex].isCompleted = true;
  }

  // VÉRIFICATION POUR L'ARRÊT ÉCOLE (ID -1)
  if (stop.stopId === -1) {
    this.logger.log(`Bus ${busId} arrivé à l'école, fin de la simulation`);
    this.completeSimulation(busId);
    return;
  }

  // Arrêter le bus pendant la durée de l'arrêt
  simulation.currentPosition.speed = 0;
  
  // DIFFUSION WEBSOCKET (existant)
  this.broadcastStopEvent(busId, {
    stopId: stop.stopId,
    isSchool: stop.isSchool,
    duration: stop.stopDuration,
    timestamp: new Date(),
  });

  // Mettre à jour la position immédiatement
  this.broadcastBusPosition(busId, simulation.currentPosition);

  // AJOUTER : NOTIFICATION PUSH AUX PARENTS
  await this.notifyBusParents(
    busId,
    'stop',
    `Le bus est arrivé à ${stop.isSchool ? 'l\'école' : 'un arrêt'}`,
    {
      stopId: stop.stopId,
      isSchool: stop.isSchool,
      stopName: stop.isSchool ? 'École' : `Arrêt ${stop.stopId}`,
      duration: stop.stopDuration,
    }
  );

  // Reprendre le mouvement après la durée de l'arrêt (ajustée par simulationSpeed)
  const adjustedDuration = (stop.stopDuration * 1000) / simulation.simulationSpeed;
  
  setTimeout(() => {
    const currentSimulation = this.activeSimulations.get(busId);
    if (currentSimulation?.isActive && !currentSimulation.isPaused) {
      this.logger.log(`Bus ${busId} repart de l'arrêt ${stop.stopId}`);
    }
  }, adjustedDuration);
}

  /**
   * Terminer la simulation
   */
private async completeSimulation(busId: number): Promise<void> {
  const simulation = this.activeSimulations.get(busId);
  if (!simulation) return;

  this.logger.log(`Bus ${busId} arrivé à destination`);
  
  simulation.isActive = false;
  simulation.currentPosition.speed = 0;
  
  // DIFFUSION WEBSOCKET (existant)
  this.broadcastCompletion(busId);
  this.broadcastBusPosition(busId, simulation.currentPosition);
  
  // AJOUTER : NOTIFICATION D'ARRIVÉE À L'ÉCOLE
  await this.notifyBusParents(
    busId,
    'arrival',
    'Votre enfant est bien arrivé à l\'école',
    {
      isSchool: true,
      message: 'Simulation terminée avec succès',
    }
  );
  
  // Arrêter la simulation après un délai
  setTimeout(() => {
    this.stopBusSimulation(busId);
  }, 5000);
}

  /**
   * Diffuser la position du bus
   */
  private broadcastBusPosition(busId: number, position: any): void {
    this.simulationGateway.broadcastPosition(busId, position);
  }

  /**
   * Diffuser l'arrivée à un arrêt
   */
  private broadcastStopEvent(busId: number, stopEvent: any): void {
    this.simulationGateway.broadcastStopEvent(busId, stopEvent);
  }

  /**
   * Diffuser l'arrivée à destination
   */
  private broadcastCompletion(busId: number): void {
    this.simulationGateway.broadcastCompletion(busId);
  }

  /**
   * Diffuser le démarrage de simulation
   */
  private broadcastSimulationStarted(busId: number, data: any): void {
    this.simulationGateway.broadcastSimulationStarted(busId, data);
  }

  /**
   * Diffuser l'arrêt de simulation
   */
  private broadcastSimulationStopped(busId: number): void {
    this.simulationGateway.broadcastSimulationStopped(busId);
  }

  /**
   * Arrêter la simulation
   */
/**
 * Arrêter la simulation - MODIFIER CETTE MÉTHODE EXISTANTE
 */
stopBusSimulation(busId: number): { success: boolean; message: string } {
  this.stopSimulationInterval(busId);
  
  const simulation = this.activeSimulations.get(busId);
  if (simulation) {
    simulation.isActive = false;
    this.activeSimulations.delete(busId);
  }
  
  this.logger.log(`Simulation arrêtée pour le bus ${busId}`);
  
  // Informer via WebSocket
  this.broadcastSimulationStopped(busId);
  
  // AJOUTER : NOTIFICATION D'ARRÊT AUX PARENTS
  this.notifyBusParents(
    busId,
    'info',
    `La simulation du bus ${busId} a été arrêtée`,
    {
      reason: 'Arrêt manuel',
      timestamp: new Date().toISOString(),
    }
  ).catch(error => {
    this.logger.error('Erreur notification arrêt:', error);
  });
  
  return { success: true, message: `Simulation arrêtée` };
}

  /**
   * Arrêter l'intervalle
   */
  private stopSimulationInterval(busId: number): void {
    const interval = this.simulationIntervals.get(busId);
    if (interval) {
      clearInterval(interval);
      this.simulationIntervals.delete(busId);
    }
  }

  /**
   * Changer la vitesse de simulation
   */
  changeSimulationSpeed(busId: number, speedMultiplier: number): { success: boolean; message: string } {
    const simulation = this.activeSimulations.get(busId);
    if (!simulation) {
      return { success: false, message: `Aucune simulation active pour le bus ${busId}` };
    }

    simulation.simulationSpeed = speedMultiplier;
    
    // Redémarrer l'intervalle avec la nouvelle vitesse
    this.startSimulationInterval(busId, speedMultiplier);
    
    this.logger.log(`Vitesse de simulation changée à ${speedMultiplier}x pour le bus ${busId}`);
    
    return { success: true, message: `Vitesse de simulation changée à ${speedMultiplier}x` };
  }

  /**
   * Pause/Reprendre la simulation
   */
  toggleSimulationPause(busId: number): { success: boolean; message: string; isPaused: boolean } {
    const simulation = this.activeSimulations.get(busId);
    if (!simulation) {
      return { success: false, message: `Aucune simulation active`, isPaused: false };
    }

    simulation.isPaused = !simulation.isPaused;
    
    if (!simulation.isPaused) {
      // Reprendre la simulation
      this.startSimulationInterval(busId, simulation.simulationSpeed);
      this.logger.log(`Simulation reprise pour le bus ${busId}`);
      return { success: true, message: `Simulation reprise`, isPaused: false };
    } else {
      // Mettre en pause
      this.stopSimulationInterval(busId);
      simulation.currentPosition.speed = 0;
      this.broadcastBusPosition(busId, simulation.currentPosition);
      this.logger.log(`Simulation mise en pause pour le bus ${busId}`);
      return { success: true, message: `Simulation mise en pause`, isPaused: true };
    }
  }

  /**
   * Calculer la distance totale d'un trajet
   */
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

  /**
   * Calculer l'heure d'arrivée estimée
   */
  private calculateEstimatedArrival(points: Array<{ lat: number; lng: number }>, speedMultiplier: number): Date {
    const totalDistance = this.calculateTotalDistance(points);
    const averageSpeed = 30; // 30 km/h en moyenne
    const hours = totalDistance / (averageSpeed * speedMultiplier);
    const arrival = new Date();
    arrival.setHours(arrival.getHours() + hours);
    return arrival;
  }

  /**
   * Calculer la distance entre deux points (en km)
   */
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

  /**
   * Calculer le cap (direction)
   */
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

  /**
   * Convertir en radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Récupérer la position actuelle d'un bus
   */
  getBusPosition(busId: number): any {
    const simulation = this.activeSimulations.get(busId);
    return simulation ? simulation.currentPosition : null;
  }

  /**
   * Récupérer l'état d'une simulation
   */
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

  /**
   * Liste des simulations actives
   */
  getActiveSimulations(): Array<any> {
    const result: any[] = [];
    for (const [busId, simulation] of this.activeSimulations) {
      result.push(this.getSimulationStatus(busId));
    }
    return result;
  }

  private async getParentsForBus(busId: number): Promise<Parent[]> {
  try {
    // Logique pour récupérer les parents dont les enfants sont dans ce bus
    // À ADAPTER selon votre modèle de données
    
    // Exemple si vous avez une relation Parent → Student → Bus
    const parents = await this.parentRepository
      .createQueryBuilder('parent')
      .leftJoin('parent.studentsAsParent1', 'student1')
      .leftJoin('parent.studentsAsParent2', 'student2')
      .leftJoin('student1.bus', 'bus1')
      .leftJoin('student2.bus', 'bus2')
      .where('bus1.id = :busId OR bus2.id = :busId', { busId })
      .getMany();
    
    this.logger.log(`Parents trouvés pour bus ${busId}: ${parents.length}`);
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

// src/simulation/simulation.service.ts
// MODIFIER LA MÉTHODE `notifyBusParents` :

private async notifyBusParents(
  busId: number,
  type: 'departure' | 'stop' | 'approaching' | 'arrival' | 'delay' | 'info' | 'emergency',
  message: string,
  extraData?: any,
): Promise<void> {
  try {
    const parentIds = await this.getParentIdsForBus(busId);
    
    if (parentIds.length === 0) {
      this.logger.warn(`Aucun parent trouvé pour le bus ${busId}`);
      return;
    }

    const title = this.getNotificationTitle(type);
    const data = {
      screen: 'TrackingTab',
      busId,
      type,
      ...extraData,
      timestamp: new Date().toISOString(),
    };

    // 1. Envoyer PUSH notifications aux parents
    await this.notificationsService.sendToParents(parentIds, title, message, data);

    // 2. AJOUTER : Diffuser via WebSocket pour les clients connectés
    this.simulationGateway.broadcastParentNotification(busId, {
      type,
      title,
      message,
      ...extraData,
    });

    this.logger.log(`✅ Notification "${type}" envoyée à ${parentIds.length} parent(s) du bus ${busId}`);
    
  } catch (error) {
    this.logger.error(`❌ Erreur envoi notification aux parents:`, error);
  }
}

/**
 * Titre de notification selon le type
 */
private getNotificationTitle(type: string): string {
  const titles = {
    departure: '🚌 Départ du bus',
    stop: '🛑 Arrêt du bus',
    approaching: '🚌 Bus en approche',
    arrival: '🎉 Arrivée à l\'école',
    delay: '⏰ Retard du bus',
    emergency: '🚨 Urgence',
    info: 'ℹ️ Information SchoolTrack',
    test: '🧪 Test de notification',
  };
  
  return titles[type] || '📱 SchoolTrack';
}
}
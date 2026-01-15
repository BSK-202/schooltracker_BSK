// src/tracking/tracking.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from '../admin/parents/entities/parent.entity';
import { Student } from '../admin/students/entities/student.entity';
import { Bus } from '../admin/buses/entities/bus.entity';
import { School } from '../admin/schools/entities/school.entity';
import { Stop } from '../admin/stops/entities/stop.entity';
import { Trajet, TypeTrajet } from '../admin/trajets/entities/trajet.entity';
import { TrajetStop } from '../admin/trajets/entities/trajet-stop.entity';

// Importer les interfaces exportées
import {
  SchoolInfo,
  StopInfo,
  BusInfo,
  RouteStopInfo,
  ChildInfo,
  TrajetInfo,
  RouteInfo,
  ParentInfo,
  SchoolsResponseDto,
  ChildrenResponseDto,
  ChildTrackingResponseDto,
  TrackingSummaryResponseDto,
} from './dto/tracking-response.dto';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
    
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    
    @InjectRepository(Stop)
    private readonly stopRepository: Repository<Stop>,
    
    @InjectRepository(Trajet)
    private readonly trajetRepository: Repository<Trajet>,
    
    @InjectRepository(TrajetStop)
    private readonly trajetStopRepository: Repository<TrajetStop>,
  ) {}

  /**
   * Récupérer toutes les écoles des enfants d'un parent
   */
  async getChildSchools(userId: number, role: string): Promise<SchoolsResponseDto> {
    this.logger.log(`Getting schools for user ${userId} (${role})`);

    if (role !== 'parent') {
      throw new NotFoundException('Cette fonctionnalité est réservée aux parents');
    }

    // Récupérer le parent avec ses enfants
    const parent = await this.parentRepository.findOne({
      where: { id: userId },
      relations: [
        'studentsAsParent1',
        'studentsAsParent2',
        'studentsAsParent1.bus',
        'studentsAsParent1.bus.school',
        'studentsAsParent2.bus',
        'studentsAsParent2.bus.school',
      ],
    });

    if (!parent) {
      throw new NotFoundException('Parent non trouvé');
    }

    // Fusionner tous les enfants
    const allStudents = [
      ...(parent.studentsAsParent1 || []),
      ...(parent.studentsAsParent2 || []),
    ];

    // Extraire les écoles uniques
    const schoolsMap = new Map<number, any>();

    allStudents.forEach(student => {
      if (student.bus && student.bus.school) {
        const school = student.bus.school;
        if (!schoolsMap.has(school.id)) {
          // Extraire les coordonnées du géométrie
          let latitude: number | null = null;
          let longitude: number | null = null;
          
          if (school.geom && 'coordinates' in school.geom) {
            const coordinates = (school.geom as any).coordinates;
            if (Array.isArray(coordinates) && coordinates.length >= 2) {
              longitude = coordinates[0];
              latitude = coordinates[1];
            }
          }

          schoolsMap.set(school.id, {
            id: school.id,
            name: school.name,
            address: school.address,
            latitude,
            longitude,
            childrenCount: 1,
            childrenIds: [student.id],
            childrenNames: [student.fullName],
          });
        } else {
          // Mettre à jour le compteur d'enfants
          const existingSchool = schoolsMap.get(school.id);
          existingSchool.childrenCount += 1;
          existingSchool.childrenIds.push(student.id);
          existingSchool.childrenNames.push(student.fullName);
        }
      }
    });

    const schools = Array.from(schoolsMap.values());

    this.logger.log(`Found ${schools.length} schools for parent ${parent.fullName}`);

    return {
      message: 'Écoles récupérées avec succès',
      schools,
      totalSchools: schools.length,
      hasMultipleSchools: schools.length > 1,
    };
  }

  /**
   * Récupérer les informations de tracking pour un enfant spécifique
   */
async getChildTrackingInfo(userId: number, role: string, childId: number): Promise<ChildTrackingResponseDto> {
    this.logger.log(`Getting tracking info for child ${childId} (user: ${userId})`);

    if (role !== 'parent') {
      throw new NotFoundException('Cette fonctionnalité est réservée aux parents');
    }

    // Vérifier que l'enfant appartient bien au parent
    const parent = await this.parentRepository.findOne({
      where: { id: userId },
      relations: [
        'studentsAsParent1',
        'studentsAsParent2',
      ],
    });

    if (!parent) {
      throw new NotFoundException('Parent non trouvé');
    }

    // Vérifier que l'enfant appartient au parent
    const allChildren = [
      ...(parent.studentsAsParent1 || []),
      ...(parent.studentsAsParent2 || []),
    ];

    const child = allChildren.find(c => c.id === childId);
    
    if (!child) {
      throw new NotFoundException('Enfant non trouvé ou non autorisé');
    }

    // Récupérer l'enfant avec toutes ses relations
    const studentWithDetails = await this.studentRepository.findOne({
      where: { id: childId },
      relations: [
        'bus',
        'bus.school',
        'stop',
        'parent1',
        'parent2',
      ],
    });

    if (!studentWithDetails) {
      throw new NotFoundException('Détails de l\'enfant non trouvés');
    }

    // Récupérer le trajet du bus pour cet enfant
    const bus = studentWithDetails.bus;
    const routeStops: RouteStopInfo[] = [];
    let currentTrajet: Trajet | null = null;

    // Préparer les informations de l'école
    let schoolInfo: SchoolInfo | null = null;
    if (bus && bus.school) {
      const school = bus.school;
      let latitude: number | null = null;
      let longitude: number | null = null;
      
      if (school.geom && 'coordinates' in school.geom) {
        const coordinates = (school.geom as any).coordinates;
        if (Array.isArray(coordinates) && coordinates.length >= 2) {
          longitude = coordinates[0];
          latitude = coordinates[1];
        }
      }

      schoolInfo = {
        id: school.id,
        name: school.name,
        address: school.address,
        latitude,
        longitude,
      };
    }

    if (bus) {
      // Trouver le trajet actif pour ce bus
      currentTrajet = await this.trajetRepository.findOne({
        where: {
          bus: { id: bus.id },
          is_actif: true,
        },
        relations: ['trajetStops', 'trajetStops.stop'],
        order: {
          heure_debut: 'ASC',
        },
      });

      if (currentTrajet) {
        // Récupérer tous les arrêts du trajet avec ordre
        const trajetStops = await this.trajetStopRepository.find({
          where: { trajet: { id: currentTrajet.id } },
          relations: ['stop'],
          order: { stop_order: 'ASC' },
        });

        // Ajouter les arrêts du trajet
        trajetStops.forEach(trajetStop => {
          const stop = trajetStop.stop;
          let latitude: number | null = null;
          let longitude: number | null = null;
          
          if (stop.geom && 'coordinates' in stop.geom) {
            const coordinates = (stop.geom as any).coordinates;
            if (Array.isArray(coordinates) && coordinates.length >= 2) {
              longitude = coordinates[0];
              latitude = coordinates[1];
            }
          }

          routeStops.push({
            id: stop.id,
            address: stop.address,
            latitude,
            longitude,
            order: trajetStop.stop_order,
            scheduledTime: trajetStop.scheduled_time,
            type: currentTrajet!.type,
            isChildStop: stop.id === studentWithDetails.stop?.id,
          });
        });

        // AJOUTER L'ÉCOLE COMME DERNIER ARRÊT
        if (schoolInfo && schoolInfo.latitude && schoolInfo.longitude) {
          const schoolStop: RouteStopInfo = {
            id: -schoolInfo.id, // ID négatif pour identifier l'école
            address: schoolInfo.address,
            latitude: schoolInfo.latitude,
            longitude: schoolInfo.longitude,
            order: routeStops.length + 1, // Dernière position
            scheduledTime: currentTrajet.heure_fin, // Utiliser l'heure de fin du trajet
            type: currentTrajet.type,
            isChildStop: false,
          };
          
          routeStops.push(schoolStop);
          
          // Réordonner si nécessaire (selon le type de trajet)
          if (currentTrajet.type === TypeTrajet.PICKUP) {
            // Pour PICKUP: école est le dernier arrêt (déjà correct)
            // On pourrait inverser l'ordre pour montrer de l'école vers les arrêts
            const schoolStopIndex = routeStops.length - 1;
            const schoolStopItem = routeStops[schoolStopIndex];
            routeStops.splice(schoolStopIndex, 1);
            routeStops.unshift(schoolStopItem); // Mettre l'école en premier
            // Réindexer les ordres
            routeStops.forEach((stop, index) => {
              stop.order = index;
            });
          }
          // Pour DROPOFF: école reste le dernier arrêt (bon pour trajet vers l'école)
        }
      }
    }

    // Préparer les informations de l'arrêt de l'enfant
    let childStopInfo: StopInfo | null = null;
    if (studentWithDetails.stop) {
      const stop = studentWithDetails.stop;
      let latitude: number | null = null;
      let longitude: number | null = null;
      
      if (stop.geom && 'coordinates' in stop.geom) {
        const coordinates = (stop.geom as any).coordinates;
        if (Array.isArray(coordinates) && coordinates.length >= 2) {
          longitude = coordinates[0];
          latitude = coordinates[1];
        }
      }

      childStopInfo = {
        id: stop.id,
        address: stop.address,
        latitude,
        longitude,
      };
    }

    // Informations du bus
    const busInfo: BusInfo | null = bus ? {
      id: bus.id,
      licencePlate: bus.licence_plate,
      capacity: bus.capacity,
      photoUrl: bus.photo_url,
      isActive: bus.is_active,
      school: schoolInfo,
    } : null;

    // Préparer les informations du trajet
    const trajetInfo: TrajetInfo | null = currentTrajet ? {
      id: currentTrajet.id,
      nom: currentTrajet.nom,
      type: currentTrajet.type,
      heureDebut: currentTrajet.heure_debut,
      heureFin: currentTrajet.heure_fin,
    } : null;

    const routeInfo: RouteInfo = {
      trajet: trajetInfo,
      stops: routeStops,
      totalStops: routeStops.length,
      hasActiveRoute: !!currentTrajet,
    };

    const childInfo: ChildInfo = {
      id: studentWithDetails.id,
      name: studentWithDetails.fullName,
      photoUrl: studentWithDetails.photoUrl,
      qrCode: studentWithDetails.qrCode,
      stop: childStopInfo,
      bus: busInfo,
      busText: bus ? `Bus ${bus.licence_plate}` : 'Non assigné',
    };

    // Informations des parents
    const parentsInfo = {
      parent1: studentWithDetails.parent1 ? {
        id: studentWithDetails.parent1.id,
        name: studentWithDetails.parent1.fullName,
        phone: studentWithDetails.parent1.phone,
      } : null,
      parent2: studentWithDetails.parent2 ? {
        id: studentWithDetails.parent2.id,
        name: studentWithDetails.parent2.fullName,
        phone: studentWithDetails.parent2.phone,
      } : null,
    };

    return {
      message: 'Informations de tracking récupérées avec succès',
      child: childInfo,
      route: routeInfo,
      school: schoolInfo,
      parents: parentsInfo,
    };
  }

  /**
   * Récupérer tous les enfants d'un parent avec leurs informations de base
   */
  async getParentChildren(userId: number, role: string): Promise<ChildrenResponseDto> {
    this.logger.log(`Getting children for parent ${userId}`);

    if (role !== 'parent') {
      throw new NotFoundException('Cette fonctionnalité est réservée aux parents');
    }

    const parent = await this.parentRepository.findOne({
      where: { id: userId },
      relations: [
        'studentsAsParent1',
        'studentsAsParent2',
        'studentsAsParent1.bus',
        'studentsAsParent1.stop',
        'studentsAsParent2.bus',
        'studentsAsParent2.stop',
        'studentsAsParent1.bus.school',
        'studentsAsParent2.bus.school',
      ],
    });

    if (!parent) {
      throw new NotFoundException('Parent non trouvé');
    }

    // Fusionner tous les enfants
    const allStudents = [
      ...(parent.studentsAsParent1 || []),
      ...(parent.studentsAsParent2 || []),
    ];

    const children = allStudents.map(student => {
      let schoolInfo: SchoolInfo | null = null;
      let busInfo: BusInfo | null = null;
      let stopInfo: StopInfo | null = null;

      if (student.bus) {
        const school = student.bus.school;
        let schoolLatitude: number | null = null;
        let schoolLongitude: number | null = null;
        
        if (school && school.geom && 'coordinates' in school.geom) {
          const coordinates = (school.geom as any).coordinates;
          if (Array.isArray(coordinates) && coordinates.length >= 2) {
            schoolLongitude = coordinates[0];
            schoolLatitude = coordinates[1];
          }
        }

        schoolInfo = school ? {
          id: school.id,
          name: school.name,
          address: school.address,
          latitude: schoolLatitude,
          longitude: schoolLongitude,
        } : null;

        busInfo = {
          id: student.bus.id,
          licencePlate: student.bus.licence_plate,
          capacity: student.bus.capacity,
          photoUrl: student.bus.photo_url,
          isActive: student.bus.is_active,
          school: schoolInfo,
        };
      }

      if (student.stop) {
        const stop = student.stop;
        let stopLatitude: number | null = null;
        let stopLongitude: number | null = null;
        
        if (stop.geom && 'coordinates' in stop.geom) {
          const coordinates = (stop.geom as any).coordinates;
          if (Array.isArray(coordinates) && coordinates.length >= 2) {
            stopLongitude = coordinates[0];
            stopLatitude = coordinates[1];
          }
        }

        stopInfo = {
          id: stop.id,
          address: stop.address,
          latitude: stopLatitude,
          longitude: stopLongitude,
        };
      }

      return {
        id: student.id,
        name: student.fullName,
        photoUrl: student.photoUrl,
        qrCode: student.qrCode,
        bus: busInfo,
        stop: stopInfo,
        school: schoolInfo,
        busText: student.bus ? `Bus ${student.bus.licence_plate}` : 'Non assigné',
        hasBus: !!student.bus,
        hasRoute: !!student.bus,
      };
    });

    return {
      message: 'Enfants récupérés avec succès',
      children,
      totalChildren: children.length,
      hasChildren: children.length > 0,
    };
  }

  /**
   * Récupérer un résumé pour l'écran principal de tracking
   */
  async getTrackingSummary(userId: number, role: string): Promise<TrackingSummaryResponseDto> {
    this.logger.log(`Getting tracking summary for user ${userId} (${role})`);

    if (role !== 'parent') {
      throw new NotFoundException('Cette fonctionnalité est réservée aux parents');
    }

    // Récupérer les écoles
    const schoolsResponse = await this.getChildSchools(userId, role);
    
    // Récupérer les enfants
    const childrenResponse = await this.getParentChildren(userId, role);
    
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
// src/admin/trajets/trajets.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trajet, TypeTrajet } from './entities/trajet.entity';
import { TrajetStop } from './entities/trajet-stop.entity';
import { Bus } from '../buses/entities/bus.entity';
import { Stop } from '../stops/entities/stop.entity';
import { CreateTrajetDto, CreateStopTrajetDto } from './dto/create-trajet.dto';
import { UpdateTrajetDto, UpdateStopTrajetDto } from './dto/update-trajet.dto';

@Injectable()
export class TrajetsService {
  constructor(
    @InjectRepository(Trajet)
    private readonly trajetRepository: Repository<Trajet>,
    
    @InjectRepository(TrajetStop)
    private readonly trajetStopRepository: Repository<TrajetStop>,
    
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
    
    @InjectRepository(Stop)
    private readonly stopRepository: Repository<Stop>
  ) {}

async findAll(filters: {
  busId?: number;
  schoolId?: number;
  type?: TypeTrajet;
  isActif?: boolean;
  page?: number;
  perPage?: number;
}) {
  const { 
    busId, 
    schoolId,
    type, 
    isActif, 
    page = 1, 
    perPage = 10 
  } = filters;

  const query = this.trajetRepository.createQueryBuilder('trajet')
    .leftJoinAndSelect('trajet.bus', 'bus')
    .leftJoinAndSelect('bus.school', 'school')
    .leftJoinAndSelect('trajet.trajetStops', 'trajetStops')
    .leftJoinAndSelect('trajetStops.stop', 'stop'); // Assurez-vous que 'stop' est bien chargé

  if (busId) {
    query.where('trajet.bus_id = :busId', { busId });
  }

  if (schoolId) {
    query.andWhere('bus.school_id = :schoolId', { schoolId });
  }

  if (type) {
    query.andWhere('trajet.type = :type', { type });
  }

  if (isActif !== undefined) {
    query.andWhere('trajet.is_actif = :isActif', { isActif });
  }

  // Ajout d'un order by pour les arrêts dans l'ordre
  query.orderBy('trajet.id', 'DESC')
       .addOrderBy('trajetStops.stop_order', 'ASC');

  const [trajets, total] = await query
    .skip((page - 1) * perPage)
    .take(perPage)
    .getManyAndCount();

  // Formater les données avec les arrêts
  const trajetsFormatted = trajets.map(trajet => ({
    id: trajet.id,
    nom: trajet.nom,
    type: trajet.type,
    is_actif: trajet.is_actif,
    heure_debut: trajet.heure_debut,
    heure_fin: trajet.heure_fin,
    created_at: trajet.created_at,
    bus: trajet.bus ? {
      id: trajet.bus.id,
      licence_plate: trajet.bus.licence_plate,
      capacity: trajet.bus.capacity, // Assurez-vous que cette propriété existe dans votre entité Bus
      school: trajet.bus.school ? {
        id: trajet.bus.school.id,
        nom: trajet.bus.school.name, // ou trajet.bus.school.nom selon votre entité
        address: trajet.bus.school.address
      } : null
    } : null,
    nombre_arrets: trajet.trajetStops?.length || 0,
    duree_estimee: this.calculerDuree(trajet.heure_debut, trajet.heure_fin),
    stops: trajet.trajetStops
      ?.sort((a, b) => a.stop_order - b.stop_order) // Trie par ordre
      .map(ts => ({
        id: ts.stop?.id,
        address: ts.stop?.address,
        stop_order: ts.stop_order, // Optionnel: si vous voulez inclure l'ordre
        scheduled_time: ts.scheduled_time, // Optionnel: si vous voulez inclure l'heure prévue
        geom: ts.stop?.geom // Assurez-vous que cette propriété existe dans votre entité Stop
      }))
      .filter(stop => stop.id) // Filtrer les arrêts null
      || []
  }));

  return {
    success: true,
    data: trajetsFormatted,
    meta: {
      total,
      page,
      perPage
    }
  };
}

  async findOne(id: number) {
    const trajet = await this.trajetRepository.findOne({
      where: { id },
      relations: ['bus', 'bus.school', 'trajetStops', 'trajetStops.stop']
    });

    if (!trajet) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Trajet non trouvé'
        }
      });
    }

    const duree_estimee = this.calculerDuree(trajet.heure_debut, trajet.heure_fin);

    const stops = trajet.trajetStops
      ?.sort((a, b) => a.stop_order - b.stop_order)
      .map(ts => ({
        id: ts.stop.id,
        address: ts.stop.address,
        stop_order: ts.stop_order,
        scheduled_time: ts.scheduled_time,
        nombre_eleves: 0 // À implémenter plus tard
      })) || [];

    return {
      success: true,
      data: {
        id: trajet.id,
        nom: trajet.nom,
        type: trajet.type,
        is_actif: trajet.is_actif,
        heure_debut: trajet.heure_debut,
        heure_fin: trajet.heure_fin,
        created_at: trajet.created_at,
        bus: trajet.bus ? {
          id: trajet.bus.id,
          licence_plate: trajet.bus.licence_plate,
          school: trajet.bus.school ? {
            id: trajet.bus.school.id,
            nom: trajet.bus.school.name
          } : null
        } : null,
        arrets: stops,
        stats: {
          total_arrets: stops.length,
          total_eleves: 0,
          duree_estimee: duree_estimee
        }
      }
    };
  }

  async create(createTrajetDto: CreateTrajetDto) {
    if (!createTrajetDto.busId || createTrajetDto.busId <= 0) {
      throw new BadRequestException({
        success: false,
        message: 'Validation échouée',
        errors: {
          busId: ['L\'ID du bus est obligatoire et doit être supérieur à 0']
        }
      });
    }

    const bus = await this.busRepository.findOne({
      where: { id: createTrajetDto.busId },
      relations: ['school']
    });

    if (!bus) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Bus non trouvé'
        }
      });
    }

    if (!bus.is_active) {
      throw new BadRequestException({
        success: false,
        message: 'Validation échouée',
        errors: {
          busId: ['Le bus n\'est pas actif']
        }
      });
    }

    const debut = this.timeToMinutes(createTrajetDto.heure_debut);
    const fin = this.timeToMinutes(createTrajetDto.heure_fin);

    if (fin <= debut) {
      throw new BadRequestException({
        success: false,
        message: 'Validation échouée',
        errors: {
          heure_fin: ['L\'heure de fin doit être après l\'heure de début']
        }
      });
    }

      const stopIds = createTrajetDto.stops.map(s => s.stopId);
      const stops = await this.stopRepository.findByIds(stopIds);

      if (stops.length !== stopIds.length) {
        throw new NotFoundException({
          success: false,
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Certains arrêts n\'ont pas été trouvés'
          }
        });
      }

    const trajet = this.trajetRepository.create({
      nom: createTrajetDto.nom,
      type: createTrajetDto.type,
      heure_debut: createTrajetDto.heure_debut,
      heure_fin: createTrajetDto.heure_fin,
      is_actif: createTrajetDto.is_actif !== undefined ? createTrajetDto.is_actif : true,
      bus: bus
    });

    const savedTrajet = await this.trajetRepository.save(trajet);

    const trajetStops = createTrajetDto.stops.map((stopDto, index) => {
      const stop = stops.find(s => s.id === stopDto.stopId);
      return this.trajetStopRepository.create({
        stop_order: index + 1,
        scheduled_time: stopDto.scheduled_time,
        trajet: savedTrajet,
        stop: stop
      });
    });

    await this.trajetStopRepository.save(trajetStops);

    const completeTrajet = await this.trajetRepository.findOneOrFail({
      where: { id: savedTrajet.id },
      relations: ['bus', 'bus.school', 'trajetStops', 'trajetStops.stop']
    });

    return {
      success: true,
      message: 'Trajet créé avec succès',
      data: {
        id: completeTrajet.id,
        nom: completeTrajet.nom,
        type: completeTrajet.type,
        heure_debut: completeTrajet.heure_debut,
        heure_fin: completeTrajet.heure_fin,
        is_actif: completeTrajet.is_actif,
        created_at: completeTrajet.created_at,
        bus: {
          id: bus.id,
          licence_plate: bus.licence_plate,
          school: bus.school ? {
            id: bus.school.id,
            nom: bus.school.name
          } : null
        },
        stops: completeTrajet.trajetStops
          .sort((a, b) => a.stop_order - b.stop_order)
          .map(ts => ({
            id: ts.stop.id,
            address: ts.stop.address,
            stop_order: ts.stop_order,
            scheduled_time: ts.scheduled_time
          }))
      }
    };
  }

  async update(id: number, updateTrajetDto: UpdateTrajetDto) {
    const trajet = await this.trajetRepository.findOne({
      where: { id },
      relations: ['bus', 'trajetStops']
    });

    if (!trajet) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Trajet non trouvé'
        }
      });
    }

    if (updateTrajetDto.busId) {
      const bus = await this.busRepository.findOne({
        where: { id: updateTrajetDto.busId }
      });

      if (!bus) {
        throw new NotFoundException({
          success: false,
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Bus non trouvé'
          }
        });
      }
      
      if (!bus.is_active) {
        throw new BadRequestException({
          success: false,
          message: 'Validation échouée',
          errors: {
            busId: ['Le bus n\'est pas actif']
          }
        });
      }
      
      trajet.bus = bus;
    }

    if (updateTrajetDto.heure_debut || updateTrajetDto.heure_fin) {
      const debut = updateTrajetDto.heure_debut 
        ? this.timeToMinutes(updateTrajetDto.heure_debut)
        : this.timeToMinutes(trajet.heure_debut);
      
      const fin = updateTrajetDto.heure_fin
        ? this.timeToMinutes(updateTrajetDto.heure_fin)
        : this.timeToMinutes(trajet.heure_fin);

      if (fin <= debut) {
        throw new BadRequestException({
          success: false,
          message: 'Validation échouée',
          errors: {
            heure_fin: ['L\'heure de fin doit être après l\'heure de début']
          }
        });
      }
    }

    Object.assign(trajet, {
      nom: updateTrajetDto.nom ?? trajet.nom,
      type: updateTrajetDto.type ?? trajet.type,
      heure_debut: updateTrajetDto.heure_debut ?? trajet.heure_debut,
      heure_fin: updateTrajetDto.heure_fin ?? trajet.heure_fin,
      is_actif: updateTrajetDto.is_actif !== undefined ? updateTrajetDto.is_actif : trajet.is_actif
    });

    const updatedTrajet = await this.trajetRepository.save(trajet);

    if (updateTrajetDto.stops) {
      await this.updateTrajetStops(updatedTrajet, updateTrajetDto.stops);
    }

    const completeTrajet = await this.trajetRepository.findOneOrFail({
      where: { id: updatedTrajet.id },
      relations: ['bus', 'bus.school', 'trajetStops', 'trajetStops.stop']
    });

    return {
      success: true,
      message: 'Trajet modifié avec succès',
      data: {
        id: completeTrajet.id,
        nom: completeTrajet.nom,
        heure_debut: completeTrajet.heure_debut,
        updated_at: completeTrajet.updated_at,
        stops: completeTrajet.trajetStops
          .sort((a, b) => a.stop_order - b.stop_order)
          .map(ts => ({
            id: ts.stop.id,
            address: ts.stop.address,
            stop_order: ts.stop_order,
            scheduled_time: ts.scheduled_time
          }))
      }
    };
  }

  private async updateTrajetStops(trajet: Trajet, stops: UpdateStopTrajetDto[]) {
    await this.trajetStopRepository.delete({ trajet: { id: trajet.id } });

    const stopIds = stops.map(s => s.stopId);
    const stopEntities = await this.stopRepository.findByIds(stopIds);

    const trajetStops = stops.map((stopDto, index) => {
      const stop = stopEntities.find(s => s.id === stopDto.stopId);
      return this.trajetStopRepository.create({
        stop_order: index + 1,
        scheduled_time: stopDto.scheduled_time,
        trajet: trajet,
        stop: stop
      });
    });

    await this.trajetStopRepository.save(trajetStops);
  }

  async remove(id: number) {
    const trajet = await this.trajetRepository.findOne({
      where: { id }
    });

    if (!trajet) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Trajet non trouvé'
        }
      });
    }

    await this.trajetRepository.remove(trajet);

    return {
      success: true,
      message: 'Trajet supprimé avec succès'
    };
  }

  private calculerDuree(heure_debut: string, heure_fin: string): string {
    const debut = this.timeToMinutes(heure_debut);
    const fin = this.timeToMinutes(heure_fin);
    const duree = fin - debut;
    
    if (duree < 0) return '0 minutes';
    
    const heures = Math.floor(duree / 60);
    const minutes = duree % 60;
    
    if (heures === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${heures} heures`;
    
    return `${heures} heures ${minutes} minutes`;
  }

  private timeToMinutes(timeString: string): number {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  }
}
// src/admin/stops/stops.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stop } from './entities/stop.entity';
import { CreateStopDto } from './dto/create-stop.dto';
import { UpdateStopDto } from './dto/update-stop.dto';

@Injectable()
export class StopsService {
  constructor(
    @InjectRepository(Stop)
    private readonly stopRepository: Repository<Stop>
  ) {}

  /**
   * Récupérer tous les arrêts
   */
  async findAll() {
    const stops = await this.stopRepository.find({
      relations: ['trajetStops', 'trajetStops.trajet', 'trajetStops.trajet.bus'],
      order: { created_at: 'DESC' }
    });

    const formattedStops = stops.map(stop => ({
      id: stop.id,
      address: stop.address,
      geom: stop.geom,
      created_at: stop.created_at,
      updated_at: stop.updated_at,
      usedInTrajets: stop.trajetStops?.length || 0,
      trajets: stop.trajetStops?.map(ts => ({
        trajetId: ts.trajet.id,
        trajetName: ts.trajet.nom,
        bus: ts.trajet.bus ? {
          id: ts.trajet.bus.id,
          licence_plate: ts.trajet.bus.licence_plate
        } : null
      })) || []
    }));

    return {
      success: true,
      data: formattedStops,
      meta: {
        total: stops.length,
        stats: {
          used: formattedStops.filter(s => s.usedInTrajets > 0).length,
          unused: formattedStops.filter(s => s.usedInTrajets === 0).length
        }
      }
    };
  }

  /**
   * Récupérer un arrêt par son ID
   */
  async findOne(id: number) {
    const stop = await this.stopRepository.findOne({
      where: { id },
      relations: [
        'trajetStops', 
        'trajetStops.trajet', 
        'trajetStops.trajet.bus', 
        'trajetStops.trajet.bus.school'
      ]
    });

    if (!stop) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Arrêt non trouvé'
        }
      });
    }

    const trajets = stop.trajetStops?.map(ts => ({
      trajetId: ts.trajet.id,
      trajetName: ts.trajet.nom,
      type: ts.trajet.type,
      stop_order: ts.stop_order,
      scheduled_time: ts.scheduled_time,
      heure_debut: ts.trajet.heure_debut,
      heure_fin: ts.trajet.heure_fin,
      is_actif: ts.trajet.is_actif,
      bus: ts.trajet.bus ? {
        id: ts.trajet.bus.id,
        licence_plate: ts.trajet.bus.licence_plate,
        school: ts.trajet.bus.school ? {
          id: ts.trajet.bus.school.id,
          name: ts.trajet.bus.school.name
        } : null
      } : null
    })) || [];

    return {
      success: true,
      data: {
        id: stop.id,
        address: stop.address,
        geom: stop.geom,
        created_at: stop.created_at,
        updated_at: stop.updated_at,
        trajets: trajets,
        stats: {
          totalTrajets: trajets.length,
          pickupCount: trajets.filter(t => t.type === 'PICKUP').length,
          dropoffCount: trajets.filter(t => t.type === 'DROPOFF').length,
          activeTrajets: trajets.filter(t => t.is_actif).length
        }
      }
    };
  }

  /**
   * Créer un nouvel arrêt
   */
  async create(createStopDto: CreateStopDto) {
    // Validation de l'adresse
    if (!createStopDto.address || createStopDto.address.trim() === '') {
      throw new BadRequestException({
        success: false,
        message: 'Validation échouée',
        errors: {
          address: ['L\'adresse est obligatoire']
        }
      });
    }

    // Validation des coordonnées
    if (!createStopDto.coordinates || createStopDto.coordinates.length !== 2) {
      throw new BadRequestException({
        success: false,
        message: 'Validation échouée',
        errors: {
          coordinates: ['Les coordonnées GPS sont invalides [longitude, latitude]']
        }
      });
    }

    const [longitude, latitude] = createStopDto.coordinates;
    
    // Validation longitude
    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException({
        success: false,
        message: 'Validation échouée',
        errors: {
          coordinates: ['La longitude doit être entre -180 et 180']
        }
      });
    }

    // Validation latitude
    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException({
        success: false,
        message: 'Validation échouée',
        errors: {
          coordinates: ['La latitude doit être entre -90 et 90']
        }
      });
    }

    // Création de l'arrêt
    const stop = this.stopRepository.create({
      address: createStopDto.address.trim(),
      geom: {
        type: 'Point',
        coordinates: createStopDto.coordinates
      }
    });

    const savedStop = await this.stopRepository.save(stop);

    return {
      success: true,
      message: 'Arrêt créé avec succès',
      data: {
        id: savedStop.id,
        address: savedStop.address,
        geom: savedStop.geom,
        created_at: savedStop.created_at
      }
    };
  }

  /**
   * Mettre à jour un arrêt
   */
  async update(id: number, updateStopDto: UpdateStopDto) {
    const stop = await this.stopRepository.findOne({
      where: { id }
    });

    if (!stop) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Arrêt non trouvé'
        }
      });
    }

    // Mise à jour de l'adresse
    if (updateStopDto.address !== undefined) {
      if (updateStopDto.address.trim() === '') {
        throw new BadRequestException({
          success: false,
          message: 'Validation échouée',
          errors: {
            address: ['L\'adresse ne peut pas être vide']
          }
        });
      }
      stop.address = updateStopDto.address.trim();
    }

    // Mise à jour des coordonnées
    if (updateStopDto.coordinates) {
      const [longitude, latitude] = updateStopDto.coordinates;
      
      if (longitude < -180 || longitude > 180) {
        throw new BadRequestException({
          success: false,
          message: 'Validation échouée',
          errors: {
            coordinates: ['La longitude doit être entre -180 et 180']
          }
        });
      }
      
      if (latitude < -90 || latitude > 90) {
        throw new BadRequestException({
          success: false,
          message: 'Validation échouée',
          errors: {
            coordinates: ['La latitude doit être entre -90 et 90']
          }
        });
      }
      
      stop.geom = {
        type: 'Point',
        coordinates: updateStopDto.coordinates
      };
    }

    // Si aucune donnée à mettre à jour
    if (updateStopDto.address === undefined && !updateStopDto.coordinates) {
      throw new BadRequestException({
        success: false,
        message: 'Validation échouée',
        errors: {
          general: ['Aucune donnée à mettre à jour']
        }
      });
    }

    const updatedStop = await this.stopRepository.save(stop);

    return {
      success: true,
      message: 'Arrêt modifié avec succès',
      data: {
        id: updatedStop.id,
        address: updatedStop.address,
        updated_at: updatedStop.updated_at
      }
    };
  }

  /**
   * Supprimer un arrêt
   */
  async remove(id: number) {
    const stop = await this.stopRepository.findOne({
      where: { id },
      relations: ['trajetStops']
    });

    if (!stop) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Arrêt non trouvé'
        }
      });
    }

    // Vérifier si l'arrêt est utilisé dans des trajets
    if (stop.trajetStops && stop.trajetStops.length > 0) {
      const trajetNames = stop.trajetStops.map(ts => ts.trajet.nom).join(', ');
      
      throw new BadRequestException({
        success: false,
        error: {
          code: 'STOP_USED_IN_TRAJETS',
          message: 'Impossible de supprimer cet arrêt. Il est utilisé dans des trajets.',
          details: {
            trajetsCount: stop.trajetStops.length,
            trajets: trajetNames
          }
        }
      });
    }

    await this.stopRepository.remove(stop);

    return {
      success: true,
      message: 'Arrêt supprimé avec succès',
      data: {
        id: stop.id,
        address: stop.address
      }
    };
  }

  /**
   * Rechercher des arrêts par adresse (optionnel)
   */
  async search(query: string) {
    if (!query || query.trim() === '') {
      throw new BadRequestException({
        success: false,
        message: 'Validation échouée',
        errors: {
          query: ['Le terme de recherche est obligatoire']
        }
      });
    }

    const stops = await this.stopRepository
      .createQueryBuilder('stop')
      .where('LOWER(stop.address) LIKE LOWER(:query)', { query: `%${query}%` })
      .leftJoinAndSelect('stop.trajetStops', 'trajetStops')
      .leftJoinAndSelect('trajetStops.trajet', 'trajet')
      .orderBy('stop.created_at', 'DESC')
      .getMany();

    const formattedStops = stops.map(stop => ({
      id: stop.id,
      address: stop.address,
      geom: stop.geom,
      usedInTrajets: stop.trajetStops?.length || 0
    }));

    return {
      success: true,
      data: formattedStops,
      meta: {
        total: stops.length,
        query: query
      }
    };
  }

  /**
   * Récupérer les arrêts disponibles (non utilisés dans des trajets)
   */
  async findAvailableStops() {
    const stops = await this.stopRepository
      .createQueryBuilder('stop')
      .leftJoin('stop.trajetStops', 'trajetStops')
      .where('trajetStops.id IS NULL')
      .orderBy('stop.created_at', 'DESC')
      .getMany();

    return {
      success: true,
      data: stops.map(stop => ({
        id: stop.id,
        address: stop.address,
        geom: stop.geom,
        created_at: stop.created_at
      })),
      meta: {
        total: stops.length,
        message: stops.length === 0 ? 'Aucun arrêt disponible' : null
      }
    };
  }
}
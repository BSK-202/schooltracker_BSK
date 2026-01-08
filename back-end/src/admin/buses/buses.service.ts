// src/admin/buses/buses.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bus } from './entities/bus.entity';
import { School } from '../schools/entities/school.entity';
import { Driver } from '../drivers/entities/driver.entity';

@Injectable()
export class BusesService {
  constructor(
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
    
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>
  ) {}

  // Récupérer tous les bus (avec filtres)
  async findAll(filters: any) {
    const { 
      schoolId, 
      isActive, 
      hasDriver, 
      page = 1, 
      perPage = 10 
    } = filters;

    const query = this.busRepository.createQueryBuilder('bus')
      .leftJoinAndSelect('bus.school', 'school')
      .leftJoinAndSelect('bus.driver', 'driver')
      .where('bus.driver_id IS NOT NULL');

    // Appliquer les filtres
    if (schoolId) {
      query.where('bus.school_id = :schoolId', { schoolId });
    }

    if (isActive !== undefined) {
      query.andWhere('bus.is_active = :isActive', { isActive });
    }

    if (hasDriver !== undefined) {
      if (hasDriver) {
        query.andWhere('bus.driver_id IS NOT NULL');
      } else {
        query.andWhere('bus.driver_id IS NULL');
      }
    }

    // Pagination
    const [buses, total] = await query
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    // Formater la réponse selon le contrat
    const formattedBuses = buses.map(bus => ({
      id: bus.id,
      licence_plate: bus.licence_plate,
      capacity: bus.capacity,
      photo_url: bus.photo_url,
      is_active: bus.is_active,
      created_at: bus.created_at,
      school: bus.school ? {
        id: bus.school.id,
        name: bus.school.name,
        address: bus.school.address
      } : null,
      driver: bus.driver ? {
        id: bus.driver.id,
        full_name: bus.driver.full_name,
        phone: bus.driver.phone
      } : null
    }));

    return {
      success: true,
      data: formattedBuses,
      meta: {
        total,
        page,
        perPage,
        filters: {
          schoolId,
          hasDriver
        }
      }
    };
  }

  // Récupérer un bus par ID
  async findOne(id: number) {
    const bus = await this.busRepository.findOne({
      where: { id },
      relations: ['school', 'driver']
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

    return {
      success: true,
      data: {
        id: bus.id,
        licence_plate: bus.licence_plate,
        capacity: bus.capacity,
        photo_url: bus.photo_url,
        is_active: bus.is_active,
        created_at: bus.created_at,
        school: bus.school ? {
          id: bus.school.id,
          name: bus.school.name,
          address: bus.school.address
        } : null,
        driver: bus.driver ? {
          id: bus.driver.id,
          full_name: bus.driver.full_name,
          phone: bus.driver.phone
        } : null,
        currentTrip: null, // À implémenter plus tard
        stats: {
          totalTrips: 0,
          totalStudentsTransported: 0
        }
      }
    };
  }

// src/admin/buses/buses.service.ts
async create(createBusDto: any) {
  console.log('🚌 Création de bus - Validation avec chauffeur obligatoire');

  // Vérifier que l'école existe
  const school = await this.schoolRepository.findOne({
    where: { id: createBusDto.schoolId }
  });

  if (!school) {
    throw new NotFoundException({
      success: false,
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'École non trouvée'
      }
    });
  }

  // ==================== VÉRIFICATION OBLIGATOIRE DU CHAUFFEUR ====================
  if (!createBusDto.driverId) {
    console.error('❌ ERREUR: driverId est manquant');
    throw new BadRequestException({
      success: false,
      message: 'Validation failed',
      errors: {
        driverId: ['L\'ID du chauffeur est OBLIGATOIRE pour créer un bus']
      }
    });
  }

  // Vérifier l'existence du chauffeur
  const driver = await this.driverRepository.findOne({
    where: { id: createBusDto.driverId },
    relations: ['assignedBus']
  });

  if (!driver) {
    console.error(`❌ ERREUR: Chauffeur avec ID ${createBusDto.driverId} non trouvé`);
    throw new NotFoundException({
      success: false,
      error: {
        code: 'DRIVER_NOT_FOUND',
        message: `Chauffeur avec ID ${createBusDto.driverId} non trouvé. Veuillez sélectionner un chauffeur valide.`
      }
    });
  }

  // Vérifier que le chauffeur n'est pas déjà assigné à un autre bus
  if (driver.assignedBus) {
    console.error(`❌ ERREUR: Chauffeur ${driver.full_name} déjà assigné`);
    throw new ConflictException({
      success: false,
      message: 'Validation de cardinalité échouée',
      error: {
        code: 'DRIVER_ALREADY_ASSIGNED',
        message: `Le chauffeur ${driver.full_name} est déjà assigné à un autre bus.`,
        details: {
          driverId: driver.id,
          currentBus: {
            id: driver.assignedBus.id,
            licence_plate: driver.assignedBus.licence_plate
          }
        }
      }
    });
  }

  // Vérifier que la plaque d'immatriculation est unique
  const existingBus = await this.busRepository.findOne({
    where: { licence_plate: createBusDto.licence_plate }
  });

  if (existingBus) {
    throw new ConflictException({
      success: false,
      message: 'Validation failed',
      errors: {
        licence_plate: ['Cette plaque d\'immatriculation existe déjà']
      }
    });
  }

  // Créer le bus AVEC le chauffeur assigné
  const bus = this.busRepository.create({
    licence_plate: createBusDto.licence_plate,
    capacity: createBusDto.capacity,
    photo_url: createBusDto.photo_url || null,
    is_active: createBusDto.is_active !== undefined ? createBusDto.is_active : true,
    school: school,
    driver: driver // ← ASSIGNATION DIRECTE DU CHAUFFEUR
  });

  const savedBus = await this.busRepository.save(bus);

  // Mettre à jour la relation inverse (chauffeur → bus)
  driver.assignedBus = savedBus;
  await this.driverRepository.save(driver);

  return {
    success: true,
    message: 'Bus créé avec succès avec chauffeur assigné',
    data: {
      id: savedBus.id,
      licence_plate: savedBus.licence_plate,
      capacity: savedBus.capacity,
      photo_url: savedBus.photo_url,
      is_active: savedBus.is_active,
      created_at: savedBus.created_at,
      school: {
        id: school.id,
        name: school.name
      },
      driver: {
        id: driver.id,
        full_name: driver.full_name,
        phone: driver.phone
      }
    }
  };
}

  // Mettre à jour un bus
  async update(id: number, updateBusDto: any) {
    const bus = await this.busRepository.findOne({ where: { id } });

    if (!bus) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Bus non trouvé'
        }
      });
    }

    // Vérifier unicité de la plaque si modifiée
    if (updateBusDto.licence_plate && updateBusDto.licence_plate !== bus.licence_plate) {
      const existingBus = await this.busRepository.findOne({
        where: { licence_plate: updateBusDto.licence_plate }
      });

      if (existingBus) {
        throw new ConflictException({
          success: false,
          message: 'Validation failed',
          errors: {
            licence_plate: ['Cette plaque d\'immatriculation existe déjà']
          }
        });
      }
    }

    // Mettre à jour
    Object.assign(bus, updateBusDto);
    const updatedBus = await this.busRepository.save(bus);

    return {
      success: true,
      message: 'Bus modifié avec succès',
      data: {
        id: updatedBus.id,
        licence_plate: updatedBus.licence_plate,
        capacity: updatedBus.capacity,
        is_active: updatedBus.is_active
      }
    };
  }

  // Assigner un chauffeur à un bus
  async assignDriver(busId: number, driverId: number) {
    const bus = await this.busRepository.findOne({ 
      where: { id: busId },
      relations: ['driver']
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

    // Vérifier que le bus n'a pas déjà un chauffeur
    if (bus.driver) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'BUS_ALREADY_HAS_DRIVER',
          message: 'Ce bus a déjà un chauffeur assigné'
        }
      });
    }

    const driver = await this.driverRepository.findOne({ 
      where: { id: driverId },
      relations: ['assignedBus']
    });

    if (!driver) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Chauffeur non trouvé'
        }
      });
    }

    // Vérifier que le chauffeur n'est pas déjà assigné
    if (driver.assignedBus) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'DRIVER_ALREADY_ASSIGNED',
          message: 'Le chauffeur est déjà assigné à un autre bus'
        }
      });
    }

    // Assigner le chauffeur
    bus.driver = driver;
    await this.busRepository.save(bus);

    return {
      success: true,
      message: 'Chauffeur assigné avec succès',
      data: {
        busId: bus.id,
        driverId: driver.id,
        driver: {
          id: driver.id,
          full_name: driver.full_name,
          phone: driver.phone
        }
      }
    };
  }

  // Retirer le chauffeur d'un bus
  async removeDriver(busId: number) {
    const bus = await this.busRepository.findOne({ 
      where: { id: busId },
      relations: ['driver']
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

    if (!bus.driver) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'BUS_HAS_NO_DRIVER',
          message: 'Ce bus n\'a pas de chauffeur assigné'
        }
      });
    }

    const previousDriver = bus.driver;
    await this.busRepository.save(bus);

    return {
      success: true,
      message: 'Chauffeur retiré du bus',
      data: {
        busId: bus.id,
        previousDriver: {
          id: previousDriver.id,
          full_name: previousDriver.full_name
        }
      }
    };
  }

  // Supprimer un bus
  async remove(id: number) {
    const bus = await this.busRepository.findOne({ 
      where: { id },
      relations: [] // Ajouter les relations pour vérifier la cardinalité
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

    // Vérifier la cardinalité (bus a des trips actifs)
    const hasActiveTrips = false; // À implémenter

    if (hasActiveTrips) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'BUS_HAS_ACTIVE_TRIPS',
          message: 'Impossible de supprimer ce bus. Il a des trips actifs ou programmés.',
          details: {
            activeTripsCount: 2
          }
        }
      });
    }

    await this.busRepository.remove(bus);

    return {
      success: true,
      message: 'Bus supprimé avec succès'
    };
  }

  // Récupérer les bus disponibles (sans chauffeur)
  async findAvailable(schoolId?: number) {
    const query = this.busRepository.createQueryBuilder('bus')
      .leftJoinAndSelect('bus.school', 'school')
      .where('bus.driver_id IS NULL')
      .andWhere('bus.is_active = true');

    if (schoolId) {
      query.andWhere('bus.school_id = :schoolId', { schoolId });
    }

    const buses = await query.getMany();

    return {
      success: true,
      data: buses.map(bus => ({
        id: bus.id,
        licence_plate: bus.licence_plate,
        capacity: bus.capacity,
        school: bus.school.name
      }))
    };
  }
}
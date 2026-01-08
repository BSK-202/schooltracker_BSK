// src/admin/schools/schools.service.ts
import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { Bus } from '../buses/entities/bus.entity';
import { Driver } from '../drivers/entities/driver.entity';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,

    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>
  ) {}

  // Récupérer toutes les écoles
  async findAll(page: number = 1, perPage: number = 10) {
    const [schools, total] = await this.schoolRepository.findAndCount({
      skip: (page - 1) * perPage,
      take: perPage,
      order: { createdAt: 'DESC' }
    });

    return {
      success: true,
      data: schools.map(school => ({
        ...school,
        stats: {
          busCount: 0, // À calculer avec une méthode séparée
          driverCount: 0, // À calculer avec une méthode séparée
          studentCount: 0
        }
      })),
      meta: {
        total,
        page,
        perPage
      }
    };
  }

  // Récupérer une école par ID
  async findOne(id: number) {
    const school = await this.schoolRepository.findOne({ 
      where: { id },
      relations: ['buses', 'drivers'] // Charger les relations
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

    // Compter les bus et chauffeurs
    const busCount = await this.busRepository.count({ where: { school: { id } } });
    const driverCount = await this.driverRepository.count({ where: { school: { id } } });

    return {
      success: true,
      data: {
        ...school,
        stats: {
          busCount,
          driverCount,
          studentCount: 0
        },
        summary: {
          totalBuses: busCount,
          totalDrivers: driverCount,
          busesWithDriver: 0, // À calculer
          busesWithoutDriver: 0 // À calculer
        }
      }
    };
  }

  // Récupérer les bus d'une école spécifique
  async getSchoolBuses(id: number, page: number = 1, perPage: number = 10) {
    // Vérifier que l'école existe
    const school = await this.schoolRepository.findOne({ where: { id } });
    
    if (!school) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'SCHOOL_NOT_FOUND',
          message: 'École non trouvée'
        }
      });
    }

    // Récupérer les bus avec pagination
    const [buses, total] = await this.busRepository.findAndCount({
      where: { school: { id } },
      relations: ['driver', 'school'], // Charger le chauffeur et l'école
      skip: (page - 1) * perPage,
      take: perPage,
      order: { created_at: 'DESC' }
    });

    // Formater la réponse
    const formattedBuses = buses.map(bus => ({
      id: bus.id,
      licence_plate: bus.licence_plate,
      capacity: bus.capacity,
      photo_url: bus.photo_url,
      is_active: bus.is_active,
      created_at: bus.created_at,
      driver: bus.driver ? {
        id: bus.driver.id,
        full_name: bus.driver.full_name,
        phone: bus.driver.phone
      } : null,
      hasDriver: !!bus.driver,
      status: bus.is_active ? 'active' : 'inactive'
    }));

    // Statistiques
    const busesWithDriver = buses.filter(bus => bus.driver).length;
    const activeBuses = buses.filter(bus => bus.is_active).length;

    return {
      success: true,
      message: `Bus de l'école ${school.name}`,
      data: formattedBuses,
      meta: {
        total,
        page,
        perPage,
        school: {
          id: school.id,
          name: school.name
        },
        stats: {
          totalBuses: total,
          busesWithDriver,
          busesWithoutDriver: total - busesWithDriver,
          activeBuses,
          inactiveBuses: total - activeBuses
        }
      }
    };
  }

  // Récupérer les chauffeurs d'une école spécifique
  async getSchoolDrivers(id: number, page: number = 1, perPage: number = 10) {
    // Vérifier que l'école existe
    const school = await this.schoolRepository.findOne({ where: { id } });
    
    if (!school) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'SCHOOL_NOT_FOUND',
          message: 'École non trouvée'
        }
      });
    }

    // Récupérer les chauffeurs avec pagination
    const [drivers, total] = await this.driverRepository.findAndCount({
      where: { school: { id } },
      relations: ['assignedBus', 'school'], // Charger le bus assigné et l'école
      skip: (page - 1) * perPage,
      take: perPage,
      order: { created_at: 'DESC' }
    });

    // Formater la réponse
    const formattedDrivers = drivers.map(driver => ({
      id: driver.id,
      full_name: driver.full_name,
      phone: driver.phone,
      created_at: driver.created_at,
      hasBus: !!driver.assignedBus,
      assignedBus: driver.assignedBus ? {
        id: driver.assignedBus.id,
        licence_plate: driver.assignedBus.licence_plate,
        capacity: driver.assignedBus.capacity,
        is_active: driver.assignedBus.is_active
      } : null,
      status: driver.assignedBus ? 'assigned' : 'unassigned'
    }));

    // Statistiques
    const driversWithBus = drivers.filter(driver => driver.assignedBus).length;

    return {
      success: true,
      message: `Chauffeurs de l'école ${school.name}`,
      data: formattedDrivers,
      meta: {
        total,
        page,
        perPage,
        school: {
          id: school.id,
          name: school.name
        },
        stats: {
          totalDrivers: total,
          driversWithBus,
          driversWithoutBus: total - driversWithBus,
          assignmentRate: total > 0 ? Math.round((driversWithBus / total) * 100) : 0
        }
      }
    };
  }

  // Créer une nouvelle école
  async create(createSchoolDto: any) {
    // Validation des coordonnées
    if (!createSchoolDto.geom || !Array.isArray(createSchoolDto.geom.coordinates)) {
      throw new ConflictException({
        success: false,
        message: 'Validation failed',
        errors: {
          'geom.coordinates': ['Les coordonnées GPS sont invalides']
        }
      });
    }

    // Création de l'école
    const school = this.schoolRepository.create({
      name: createSchoolDto.name,
      address: createSchoolDto.address,
      geom: {
        type: 'Point',
        coordinates: createSchoolDto.geom.coordinates
      }
    });

    const savedSchool = await this.schoolRepository.save(school);

    return {
      success: true,
      message: 'École créée avec succès',
      data: savedSchool
    };
  }

  // Modifier une école
  async update(id: number, updateSchoolDto: any) {
    const school = await this.schoolRepository.findOne({ where: { id } });

    if (!school) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'École non trouvée'
        }
      });
    }

    // Mise à jour
    Object.assign(school, updateSchoolDto);
    const updatedSchool = await this.schoolRepository.save(school);

    return {
      success: true,
      message: 'École modifiée avec succès',
      data: updatedSchool
    };
  }

  // Supprimer une école
  async remove(id: number) {
    const school = await this.schoolRepository.findOne({ 
      where: { id },
      relations: ['buses', 'drivers'] // Charger les relations pour vérification
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

    // Vérifier si l'école a des bus
    if (school.buses && school.buses.length > 0) {
      throw new ConflictException({
        success: false,
        message: 'Impossible de supprimer l\'école',
        error: {
          code: 'SCHOOL_HAS_BUSES',
          message: 'Cette école possède encore des bus. Veuillez d\'abord supprimer ou réassigner tous les bus.',
          details: {
            busCount: school.buses.length,
            buses: school.buses.map(bus => ({
              id: bus.id,
              licence_plate: bus.licence_plate
            }))
          }
        }
      });
    }

    // Vérifier si l'école a des chauffeurs
    if (school.drivers && school.drivers.length > 0) {
      throw new ConflictException({
        success: false,
        message: 'Impossible de supprimer l\'école',
        error: {
          code: 'SCHOOL_HAS_DRIVERS',
          message: 'Cette école possède encore des chauffeurs. Veuillez d\'abord supprimer ou réassigner tous les chauffeurs.',
          details: {
            driverCount: school.drivers.length,
            drivers: school.drivers.map(driver => ({
              id: driver.id,
              full_name: driver.full_name
            }))
          }
        }
      });
    }

    await this.schoolRepository.remove(school);

    return {
      success: true,
      message: 'École supprimée avec succès'
    };
  }
}
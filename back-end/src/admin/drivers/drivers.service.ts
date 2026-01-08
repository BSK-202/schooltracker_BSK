// src/admin/drivers/drivers.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Driver } from './entities/driver.entity';
import { Bus } from '../buses/entities/bus.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { School } from '../schools/entities/school.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    
    @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
    @InjectRepository(School) // ← NOUVEAU
    private readonly schoolRepository: Repository<School>
  ) {}

  // Générer un mot de passe aléatoire
  private generatePassword(length: number = 8): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  // Hacher un mot de passe
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Récupérer tous les chauffeurs
  async findAll(filters: any) {
    const { 
      hasAssignedBus, 
      schoolId,
      page = 1, 
      perPage = 10 
    } = filters;

    const query = this.driverRepository.createQueryBuilder('driver')
      .leftJoinAndSelect('driver.assignedBus', 'bus')
      .leftJoinAndSelect('driver.school', 'school') // ← NOUVEAU : Joindre l'école
      .leftJoinAndSelect('bus.school', 'busSchool');
        // Filtre optionnel: par école (via le bus)
      if (schoolId) {
        query.where('driver.school_id = :schoolId', { schoolId });
      }
      if (filters.schoolId) {
        query.where('bus.school_id = :schoolId', { schoolId: filters.schoolId });
      }

      // Filtre optionnel: par plaque d'immatriculation
      if (filters.licencePlate) {
        query.where('bus.licence_plate LIKE :licencePlate', { 
          licencePlate: `%${filters.licencePlate}%` 
        });
      }

    // Pagination
    const [drivers, total] = await query
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

      const formattedDrivers = drivers.map(driver => ({
        id: driver.id,
        full_name: driver.full_name,
        phone: driver.phone,
        created_at: driver.created_at,
        school: { // ← NOUVEAU : Informations de l'école
          id: driver.school.id,
          name: driver.school.name,
          address: driver.school.address
        },
        assignedBus: driver.assignedBus ? {
          id: driver.assignedBus.id,
          licence_plate: driver.assignedBus.licence_plate,
          school: driver.assignedBus.school ? {
            id: driver.assignedBus.school.id,
            name: driver.assignedBus.school.name
          } : null
        } : null
      }));


    return {
      success: true,
      data: formattedDrivers,
      meta: {
        total,
        page,
        perPage,
      }
    };
  }

// Dans drivers.service.ts - méthode findOne
async findOne(id: number) {
  const driver = await this.driverRepository.findOne({
    where: { id },
    relations: ['assignedBus', 'assignedBus.school', 'school'] // ← Ajouter 'school'
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

  return {
    success: true,
    data: {
      id: driver.id,
      full_name: driver.full_name,
      phone: driver.phone,
      created_at: driver.created_at,
      school: { // ← NOUVEAU
        id: driver.school.id,
        name: driver.school.name,
        address: driver.school.address
      },
      assignedBus: driver.assignedBus ? {
        id: driver.assignedBus.id,
        licence_plate: driver.assignedBus.licence_plate,
        capacity: driver.assignedBus.capacity,
        school: driver.assignedBus.school ? {
          id: driver.assignedBus.school.id,
          name: driver.assignedBus.school.name
        } : null
      } : null,
      stats: {
        totalTripsCompleted: 0,
        totalStudentsTransported: 0,
        averageRating: 4.8
      }
    }
  };
}

  async create(createDriverDto: any) {
    console.log('🚗 Création chauffeur - Avec école obligatoire');

    // ==================== VÉRIFICATION DE L'ÉCOLE ====================
    if (!createDriverDto.schoolId) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed',
        errors: {
          schoolId: ["L'ID de l'école est OBLIGATOIRE"]
        }
      });
    }

    // Vérifier l'existence de l'école
    const school = await this.schoolRepository.findOne({
      where: { id: createDriverDto.schoolId }
    });

    if (!school) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'SCHOOL_NOT_FOUND',
          message: `École avec ID ${createDriverDto.schoolId} non trouvée`
        }
      });
    }

    // ==================== VÉRIFICATION DU TÉLÉPHONE ====================
    if (!createDriverDto.phone) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed',
        errors: {
          phone: ['Le numéro de téléphone est requis']
        }
      });
    }

    const existingDriver = await this.driverRepository.findOne({
      where: { phone: createDriverDto.phone }
    });

    if (existingDriver) {
      throw new ConflictException({
        success: false,
        message: 'Validation failed',
        errors: {
          phone: ['Ce numéro de téléphone est déjà utilisé']
        }
      });
    }

    // ==================== VÉRIFICATION DU NOM ====================
    if (!createDriverDto.full_name) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed',
        errors: {
          full_name: ['Le nom complet est requis']
        }
      });
    }

    // ==================== CRÉATION DU CHAUFFEUR ====================
    console.log(`✅ Toutes les validations passées, création du chauffeur pour l'école: ${school.name}`);

    // Générer mot de passe
    const plainPassword = this.generatePassword(10);
    const hashedPassword = await this.hashPassword(plainPassword);

    // Créer le chauffeur avec l'école
    const driver = this.driverRepository.create({
      full_name: createDriverDto.full_name,
      phone: createDriverDto.phone,
      password: hashedPassword,
      school: school, // ← ASSIGNATION DE L'ÉCOLE
      assignedBus: null // ← Pas de bus par défaut
    });

    const savedDriver = await this.driverRepository.save(driver);
    console.log(`✅ Chauffeur créé: ${savedDriver.full_name} (ID: ${savedDriver.id}) pour l'école: ${school.name}`);

    // Si un busId est fourni, vérifier qu'il appartient à la même école
    if (createDriverDto.busId) {
      console.log(`🔄 Assignation optionnelle au bus: ${createDriverDto.busId}`);
      
      const bus = await this.busRepository.findOne({
        where: { id: createDriverDto.busId },
        relations: ['school', 'driver']
      });

      if (!bus) {
        throw new NotFoundException({
          success: false,
          error: {
            code: 'BUS_NOT_FOUND',
            message: `Bus avec ID ${createDriverDto.busId} non trouvé`
          }
        });
      }

      // Vérifier que le bus appartient à la même école
      if (bus.school.id !== school.id) {
        throw new ConflictException({
          success: false,
          error: {
            code: 'BUS_SCHOOL_MISMATCH',
            message: `Le bus ${bus.licence_plate} n'appartient pas à l'école ${school.name}`,
            details: {
              driverSchoolId: school.id,
              busSchoolId: bus.school.id,
              driverSchool: school.name,
              busSchool: bus.school.name
            }
          }
        });
      }

      // Vérifier que le bus n'a pas déjà un chauffeur
      if (bus.driver) {
        throw new ConflictException({
          success: false,
          error: {
            code: 'BUS_ALREADY_HAS_DRIVER',
            message: `Le bus ${bus.licence_plate} a déjà un chauffeur`
          }
        });
      }

      // Assigner le bus
      driver.assignedBus = bus;
      bus.driver = driver;
      await this.driverRepository.save(driver);
      await this.busRepository.save(bus);
      console.log(`✅ Bus assigné: ${bus.licence_plate} → ${driver.full_name}`);
    }

    // ==================== RÉPONSE FINALE ====================
    const responseData = {
      id: savedDriver.id,
      full_name: savedDriver.full_name,
      phone: savedDriver.phone,
      created_at: savedDriver.created_at,
      school: {
        id: school.id,
        name: school.name
      },
      generatedPassword: plainPassword,
      note: "⚠️ Notez ce mot de passe ! Il ne sera plus affiché."
    };

    // Ajouter les infos du bus si assigné
    if (createDriverDto.busId) {
      const driverWithBus = await this.driverRepository.findOne({
        where: { id: savedDriver.id },
        relations: ['assignedBus']
      });
      
      responseData['bus'] = driverWithBus?.assignedBus ? {
        id: driverWithBus.assignedBus.id,
        licence_plate: driverWithBus.assignedBus.licence_plate
      } : null;
    } else {
      responseData['bus'] = null;
    }

    return {
      success: true,
      message: createDriverDto.busId 
        ? 'Chauffeur créé et assigné à un bus avec succès' 
        : 'Chauffeur créé avec succès (sans bus assigné)',
      data: responseData
    };
  }

  // Assigner un bus à un chauffeur
  async assignBus(driverId: number, busId: number) {
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

    // Vérifier que le chauffeur n'a pas déjà un bus
    if (driver.assignedBus) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'DRIVER_ALREADY_ASSIGNED',
          message: 'Ce chauffeur est déjà assigné à un bus'
        }
      });
    }

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

    // Assigner le bus
    bus.driver = driver;
    await this.busRepository.save(bus);

    return {
      success: true,
      message: 'Bus assigné avec succès',
      data: {
        driverId: driver.id,
        busId: bus.id,
        bus: {
          id: bus.id,
          licence_plate: bus.licence_plate
        }
      }
    };
  }

  // Modifier un chauffeur
  async update(id: number, updateDriverDto: any) {
    const driver = await this.driverRepository.findOne({ where: { id } });

    if (!driver) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Chauffeur non trouvé'
        }
      });
    }

    // Vérifier unicité du téléphone si modifié
    if (updateDriverDto.phone && updateDriverDto.phone !== driver.phone) {
      const existingDriver = await this.driverRepository.findOne({
        where: { phone: updateDriverDto.phone }
      });

      if (existingDriver) {
        throw new ConflictException({
          success: false,
          message: 'Validation failed',
          errors: {
            phone: ['Ce numéro de téléphone est déjà utilisé']
          }
        });
      }
    }

    // Mettre à jour
    Object.assign(driver, updateDriverDto);
    const updatedDriver = await this.driverRepository.save(driver);

    return {
      success: true,
      message: 'Chauffeur modifié avec succès',
      data: {
        id: updatedDriver.id,
        full_name: updatedDriver.full_name,
        phone: updatedDriver.phone,
        updatedAt: new Date().toISOString()
      }
    };
  }

  // Réinitialiser le mot de passe (manuel)
  async resetPassword(id: number, newPassword: string) {
    const driver = await this.driverRepository.findOne({ where: { id } });

    if (!driver) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Chauffeur non trouvé'
        }
      });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await this.hashPassword(newPassword);
    driver.password = hashedPassword;
    await this.driverRepository.save(driver);

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    };
  }

  // Générer un nouveau mot de passe
  async generateNewPassword(id: number) {
    const driver = await this.driverRepository.findOne({ where: { id } });

    if (!driver) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Chauffeur non trouvé'
        }
      });
    }

    // Générer un nouveau mot de passe
    const plainPassword = this.generatePassword(10);
    console.log('🔄 Nouveau mot de passe généré:', plainPassword);
    
    // Hacher et sauvegarder
    const hashedPassword = await this.hashPassword(plainPassword);
    driver.password = hashedPassword;
    await this.driverRepository.save(driver);

    return {
      success: true,
      message: 'Nouveau mot de passe généré',
      data: {
        driverId: driver.id,
        full_name: driver.full_name,
        newPassword: plainPassword,
        note: "⚠️ Communiquez ce nouveau mot de passe au chauffeur !"
      }
    };
  }

  // Supprimer un chauffeur
  async remove(id: number) {
    const driver = await this.driverRepository.findOne({
      where: { id },
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

    // Vérifier la cardinalité (chauffeur a un bus assigné)
    if (driver.assignedBus) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'DRIVER_HAS_ASSIGNED_BUS',
          message: 'Impossible de supprimer ce chauffeur. Il est assigné à un bus.',
          details: {
            busId: driver.assignedBus.id,
            licence_plate: driver.assignedBus.licence_plate
          }
        }
      });
    }

    await this.driverRepository.remove(driver);

    return {
      success: true,
      message: 'Chauffeur supprimé avec succès'
    };
  }


}
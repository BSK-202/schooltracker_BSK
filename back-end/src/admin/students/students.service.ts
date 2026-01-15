// src/students/students.service.ts
import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Parent } from '../parents/entities/parent.entity';
import { Stop } from 'src/admin/stops/entities/stop.entity';
import * as QRCode from 'qrcode';
import { Bus } from 'src/admin/buses/entities/bus.entity'; // AJOUTER CET IMPORT


@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Stop)
    private readonly stopRepository: Repository<Stop>,
     @InjectRepository(Bus) // AJOUTER CE REPOSITORY
    private readonly busRepository: Repository<Bus>
  ) {}

  // Générer un QR code unique
  private async generateUniqueQRCode(): Promise<string> {
    let isUnique = false;
    let qrCode = '';

    while (!isUnique) {
      // Générer un ID unique basé sur le timestamp et un random
      const uniqueId = `STU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Vérifier si ce QR code existe déjà
      const existingStudent = await this.studentRepository.findOne({
        where: { qrCode: uniqueId }
      });

      if (!existingStudent) {
        qrCode = uniqueId;
        isUnique = true;
      }
    }

    return qrCode;
  }

  /**
   * Récupérer tous les élèves
   */
  async findAll() {
    const students = await this.studentRepository.find({
      relations: ['parent1', 'parent2', 'stop'],
      order: { createdAt: 'DESC' }
    });

    const formattedStudents = students.map(student => ({
      id: student.id,
      fullName: student.fullName,
      qrCode: student.qrCode,
      photoUrl: student.photoUrl,
      createdAt: student.createdAt,
      stop: student.stop ? {
        id: student.stop.id,
        address: student.stop.address
      } : null,
      parents: {
        parent1: student.parent1 ? {
          id: student.parent1.id,
          fullName: student.parent1.fullName,
          phone: student.parent1.phone
        } : null,
        parent2: student.parent2 ? {
          id: student.parent2.id,
          fullName: student.parent2.fullName,
          phone: student.parent2.phone
        } : null
      }
    }));

    return {
      success: true,
      data: formattedStudents,
      meta: { total: students.length }
    };
  }

  /**
   * Récupérer un élève par ID
   */
  async findOne(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['parent1', 'parent2', 'stop']
    });

    if (!student) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'STUDENT_NOT_FOUND',
          message: 'Élève non trouvé'
        }
      });
    }

    return {
      success: true,
      data: {
        id: student.id,
        fullName: student.fullName,
        qrCode: student.qrCode,
        photoUrl: student.photoUrl,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        stop: student.stop ? {
          id: student.stop.id,
          address: student.stop.address,
          coordinates: student.stop.geom.coordinates
        } : null,
        parents: {
          parent1: student.parent1 ? {
            id: student.parent1.id,
            fullName: student.parent1.fullName,
            phone: student.parent1.phone,
            sexe: student.parent1.sexe
          } : null,
          parent2: student.parent2 ? {
            id: student.parent2.id,
            fullName: student.parent2.fullName,
            phone: student.parent2.phone,
            sexe: student.parent2.sexe
          } : null
        }
      }
    };
  }

  /**
   * Créer un nouvel élève
   */
async create(createStudentDto: CreateStudentDto) {
    // Vérifier si l'arrêt existe
    const stop = await this.stopRepository.findOne({
      where: { id: createStudentDto.stopId }
    });

    if (!stop) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'STOP_NOT_FOUND',
          message: 'Arrêt non trouvé'
        }
      });
    }

    // ========== VÉRIFIER ET RÉCUPÉRER LE BUS ==========
    const bus = await this.busRepository.findOne({
      where: { id: createStudentDto.busId },
      relations: ['students'] // Charger les élèves déjà assignés
    });

    if (!bus) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'BUS_NOT_FOUND',
          message: 'Bus non trouvé'
        }
      });
    }

    // ========== VÉRIFIER LA CAPACITÉ DU BUS ==========
    // Compter le nombre d'élèves déjà assignés à ce bus
    const existingStudentsCount = await this.studentRepository.count({
      where: { bus: { id: bus.id } }
    });

    console.log(`🚌 Bus ID ${bus.id}: ${existingStudentsCount}/${bus.capacity} élèves assignés`);

    // Vérifier si la capacité est dépassée
    if (existingStudentsCount >= bus.capacity) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'BUS_CAPACITY_EXCEEDED',
          message: `Le bus est déjà plein (${existingStudentsCount}/${bus.capacity} élèves)`,
          details: {
            busId: bus.id,
            licencePlate: bus.licence_plate,
            currentStudents: existingStudentsCount,
            capacity: bus.capacity,
            remainingSeats: 0
          }
        }
      });
    }

    // Calculer les places restantes
    const remainingSeats = bus.capacity - existingStudentsCount;
    
    if (remainingSeats <= 0) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'BUS_FULL',
          message: `Le bus ${bus.licence_plate} est complet. Veuillez choisir un autre bus.`,
          details: {
            busId: bus.id,
            licencePlate: bus.licence_plate,
            capacity: bus.capacity
          }
        }
      });
    }

    // Avertissement si peu de places restantes
    if (remainingSeats <= 3) {
      console.warn(`⚠️  Attention: Le bus ${bus.licence_plate} n'a plus que ${remainingSeats} place(s) disponible(s)`);
    }

    // Vérifier les parents si spécifiés
    let parent1: Parent | null = null;
    let parent2: Parent | null = null;

    if (createStudentDto.parent1Id) {
      const foundParent1 = await this.parentRepository.findOne({
        where: { id: createStudentDto.parent1Id }
      });

      if (!foundParent1) {
        throw new NotFoundException({
          success: false,
          error: {
            code: 'PARENT1_NOT_FOUND',
            message: 'Parent 1 non trouvé'
          }
        });
      }
      parent1 = foundParent1;
    }

    if (createStudentDto.parent2Id) {
      const foundParent2 = await this.parentRepository.findOne({
        where: { id: createStudentDto.parent2Id }
      });

      if (!foundParent2) {
        throw new NotFoundException({
          success: false,
          error: {
            code: 'PARENT2_NOT_FOUND',
            message: 'Parent 2 non trouvé'
          }
        });
      }
      parent2 = foundParent2;
    }

    // Générer le QR code unique
    const qrCode = await this.generateUniqueQRCode();

    // Créer l'élève
    const student = new Student();
    student.fullName = createStudentDto.fullName.trim();
    student.qrCode = qrCode;
    student.photoUrl = createStudentDto.photoUrl || null;
    student.stop = stop;
    student.bus = bus;  // ← AJOUTEZ CETTE LIGNE !!! C'est ce qui manque
    student.parent1 = parent1;
    student.parent2 = parent2;

    const savedStudent = await this.studentRepository.save(student);

    // Générer l'URL du QR code (optionnel)
    let qrCodeImageUrl: string | null = null;
    try {
      qrCodeImageUrl = await QRCode.toDataURL(qrCode);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }

 return {
      success: true,
      message: 'Élève créé avec succès',
      data: {
        id: savedStudent.id,
        fullName: savedStudent.fullName,
        qrCode: savedStudent.qrCode,
        qrCodeImageUrl: qrCodeImageUrl,
        photoUrl: savedStudent.photoUrl,
        stop: {
          id: stop.id,
          address: stop.address
        },
        bus: {
          id: bus.id,
          licencePlate: bus.licence_plate,
          capacity: bus.capacity,
          currentStudents: existingStudentsCount + 1,
          remainingSeats: remainingSeats - 1
        },
        parents: {
          parent1: parent1 ? {
            id: parent1.id,
            fullName: parent1.fullName
          } : null,
          parent2: parent2 ? {
            id: parent2.id,
            fullName: parent2.fullName
          } : null
        },
        createdAt: savedStudent.createdAt
      }
    };
  }

  /**
   * Mettre à jour un élève
   */
async update(id: number, updateStudentDto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['stop', 'parent1', 'parent2', 'bus']
    });

    if (!student) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'STUDENT_NOT_FOUND',
          message: 'Élève non trouvé'
        }
      });
    }

    // ========== VÉRIFIER LE BUS SI MODIFIÉ ==========
    if (updateStudentDto.busId !== undefined) {
      const newBus = await this.busRepository.findOne({
        where: { id: updateStudentDto.busId }
      });

      if (!newBus) {
        throw new NotFoundException({
          success: false,
          error: {
            code: 'BUS_NOT_FOUND',
            message: 'Bus non trouvé'
          }
        });
      }

      // Vérifier la capacité du nouveau bus
      const existingStudentsCount = await this.studentRepository.count({
        where: { bus: { id: newBus.id } }
      });

      // Si l'élève est déjà dans ce bus, ne pas compter deux fois
      const isSameBus = student.bus.id === newBus.id;
      const adjustedCount = isSameBus ? existingStudentsCount : existingStudentsCount + 1;

      if (adjustedCount > newBus.capacity) {
        throw new ConflictException({
          success: false,
          error: {
            code: 'BUS_CAPACITY_EXCEEDED',
            message: `Le bus ${newBus.licence_plate} ne peut pas accueillir plus d'élèves (${existingStudentsCount}/${newBus.capacity})`,
            details: {
              busId: newBus.id,
              licencePlate: newBus.licence_plate,
              currentStudents: existingStudentsCount,
              capacity: newBus.capacity
            }
          }
        });
      }

      student.bus = newBus;
    }

    // Mettre à jour les champs de base
    if (updateStudentDto.fullName !== undefined) {
      student.fullName = updateStudentDto.fullName.trim();
    }

    if (updateStudentDto.photoUrl !== undefined) {
      student.photoUrl = updateStudentDto.photoUrl || null;
    }


    // Mettre à jour l'arrêt si spécifié
    if (updateStudentDto.stopId !== undefined) {
      const stop = await this.stopRepository.findOne({
        where: { id: updateStudentDto.stopId }
      });

      if (!stop) {
        throw new NotFoundException({
          success: false,
          error: {
            code: 'STOP_NOT_FOUND',
            message: 'Arrêt non trouvé'
          }
        });
      }
      student.stop = stop;
    }

    // Mettre à jour les parents si spécifiés
    if (updateStudentDto.parent1Id !== undefined) {
      if (updateStudentDto.parent1Id === null) {
        student.parent1 = null;
      } else {
        const parent1 = await this.parentRepository.findOne({
          where: { id: updateStudentDto.parent1Id }
        });

        if (!parent1) {
          throw new NotFoundException({
            success: false,
            error: {
              code: 'PARENT1_NOT_FOUND',
              message: 'Parent 1 non trouvé'
            }
          });
        }
        student.parent1 = parent1;
      }
    }

    if (updateStudentDto.parent2Id !== undefined) {
      if (updateStudentDto.parent2Id === null) {
        student.parent2 = null;
      } else {
        const parent2 = await this.parentRepository.findOne({
          where: { id: updateStudentDto.parent2Id }
        });

        if (!parent2) {
          throw new NotFoundException({
            success: false,
            error: {
              code: 'PARENT2_NOT_FOUND',
              message: 'Parent 2 non trouvé'
            }
          });
        }
        student.parent2 = parent2;
      }
    }

    const updatedStudent = await this.studentRepository.save(student);

    return {
      success: true,
      message: 'Élève modifié avec succès',
      data: {
        id: updatedStudent.id,
        fullName: updatedStudent.fullName,
        bus: {
          id: updatedStudent.bus.id,
          licencePlate: updatedStudent.bus.licence_plate
        },
        updatedAt: updatedStudent.updatedAt
      }
    };
  }

  /**
   * Supprimer un élève
   */
  async remove(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id }
    });

    if (!student) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'STUDENT_NOT_FOUND',
          message: 'Élève non trouvé'
        }
      });
    }

    await this.studentRepository.remove(student);

    return {
      success: true,
      message: 'Élève supprimé avec succès',
      data: {
        id: student.id,
        fullName: student.fullName
      }
    };
  }

  /**
   * Rechercher un élève par QR code
   */
  async findByQrCode(qrCode: string) {
    const student = await this.studentRepository.findOne({
      where: { qrCode },
      relations: ['parent1', 'parent2', 'stop']
    });

    if (!student) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'STUDENT_NOT_FOUND',
          message: 'Élève non trouvé'
        }
      });
    }

    return {
      success: true,
      data: {
        id: student.id,
        fullName: student.fullName,
        photoUrl: student.photoUrl,
        stop: student.stop ? {
          id: student.stop.id,
          address: student.stop.address
        } : null,
        parents: {
          parent1: student.parent1 ? {
            id: student.parent1.id,
            fullName: student.parent1.fullName,
            phone: student.parent1.phone
          } : null,
          parent2: student.parent2 ? {
            id: student.parent2.id,
            fullName: student.parent2.fullName,
            phone: student.parent2.phone
          } : null
        }
      }
    };
  }

  /**
   * Rechercher des élèves par nom
   */
  async searchByName(query: string) {
    if (!query || query.trim() === '') {
      return {
        success: true,
        data: [],
        meta: { total: 0, query }
      };
    }

    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.parent1', 'parent1')
      .leftJoinAndSelect('student.parent2', 'parent2')
      .leftJoinAndSelect('student.stop', 'stop')
      .where('LOWER(student.fullName) LIKE LOWER(:query)', { query: `%${query}%` })
      .orderBy('student.createdAt', 'DESC')
      .getMany();

    const formattedStudents = students.map(student => ({
      id: student.id,
      fullName: student.fullName,
      qrCode: student.qrCode,
      photoUrl: student.photoUrl,
      stop: student.stop ? {
        id: student.stop.id,
        address: student.stop.address
      } : null,
      parents: {
        parent1: student.parent1 ? {
          id: student.parent1.id,
          fullName: student.parent1.fullName
        } : null,
        parent2: student.parent2 ? {
          id: student.parent2.id,
          fullName: student.parent2.fullName
        } : null
      }
    }));

    return {
      success: true,
      data: formattedStudents,
      meta: { total: students.length, query }
    };
  }
}
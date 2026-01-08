// src/parents/parents.service.ts
import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from './entities/parent.entity';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>
  ) {}

  // Générer un mot de passe aléatoire
  private generateRandomPassword(): string {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Récupérer tous les parents
   */
  async findAll() {
    const parents = await this.parentRepository.find({
      relations: ['studentsAsParent1', 'studentsAsParent2'],
      order: { createdAt: 'DESC' }
    });

    const formattedParents = parents.map(parent => ({
      id: parent.id,
      fullName: parent.fullName,
      phone: parent.phone,
      sexe: parent.sexe,
      photoUrl: parent.photoUrl,
      createdAt: parent.createdAt,
      updatedAt: parent.updatedAt,
      totalChildren: (parent.studentsAsParent1?.length || 0) + (parent.studentsAsParent2?.length || 0)
    }));

    return {
      success: true,
      data: formattedParents,
      meta: { total: parents.length }
    };
  }

  /**
   * Récupérer un parent par ID
   */
  async findOne(id: number) {
    const parent = await this.parentRepository.findOne({
      where: { id },
      relations: [
        'studentsAsParent1',
        'studentsAsParent1.stop',
        'studentsAsParent2',
        'studentsAsParent2.stop'
      ]
    });

    if (!parent) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'PARENT_NOT_FOUND',
          message: 'Parent non trouvé'
        }
      });
    }

    // Fusionner tous les enfants
    const allStudents = [
      ...(parent.studentsAsParent1 || []),
      ...(parent.studentsAsParent2 || [])
    ];

    return {
      success: true,
      data: {
        id: parent.id,
        fullName: parent.fullName,
        phone: parent.phone,
        sexe: parent.sexe,
        photoUrl: parent.photoUrl,
        createdAt: parent.createdAt,
        updatedAt: parent.updatedAt,
        students: allStudents.map(student => ({
          id: student.id,
          fullName: student.fullName,
          qrCode: student.qrCode,
          photoUrl: student.photoUrl,
          stop: student.stop ? {
            id: student.stop.id,
            address: student.stop.address
          } : null
        }))
      }
    };
  }

async create(createParentDto: CreateParentDto) {
  // Vérifier si le téléphone existe déjà
  const existingParent = await this.parentRepository.findOne({
    where: { phone: createParentDto.phone }
  });

  if (existingParent) {
    throw new ConflictException({
      success: false,
      error: {
        code: 'PHONE_ALREADY_EXISTS',
        message: 'Ce numéro de téléphone est déjà utilisé'
      }
    });
  }

  // Générer et hacher le mot de passe
  const plainPassword = this.generateRandomPassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Créer le parent
  const parent = new Parent();
  parent.fullName = createParentDto.fullName.trim();
  parent.phone = createParentDto.phone.trim();
  parent.sexe = createParentDto.sexe !== undefined ? createParentDto.sexe : null;
  parent.photoUrl = createParentDto.photoUrl || null; // string ou null
  parent.password = hashedPassword;

  const savedParent = await this.parentRepository.save(parent);

  // Retourner le mot de passe en clair pour le premier affichage
  return {
    success: true,
    message: 'Parent créé avec succès',
    data: {
      id: savedParent.id,
      fullName: savedParent.fullName,
      phone: savedParent.phone,
      sexe: savedParent.sexe,
      photoUrl: savedParent.photoUrl,
      generatedPassword: plainPassword, // À partager avec le parent
      createdAt: savedParent.createdAt
    }
  };
}

async update(id: number, updateParentDto: UpdateParentDto) {
  const parent = await this.parentRepository.findOne({ where: { id } });

  if (!parent) {
    throw new NotFoundException({
      success: false,
      error: {
        code: 'PARENT_NOT_FOUND',
        message: 'Parent non trouvé'
      }
    });
  }

  // Vérifier si le nouveau téléphone existe déjà
  if (updateParentDto.phone && updateParentDto.phone !== parent.phone) {
    const existingPhone = await this.parentRepository.findOne({
      where: { phone: updateParentDto.phone }
    });

    if (existingPhone) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'PHONE_ALREADY_EXISTS',
          message: 'Ce numéro de téléphone est déjà utilisé'
        }
      });
    }
    parent.phone = updateParentDto.phone.trim();
  }

  // Mettre à jour les autres champs
  if (updateParentDto.fullName !== undefined) {
    parent.fullName = updateParentDto.fullName.trim();
  }

  if (updateParentDto.sexe !== undefined) {
    parent.sexe = updateParentDto.sexe; // string ou undefined
  }

  if (updateParentDto.photoUrl !== undefined) {
    parent.photoUrl = updateParentDto.photoUrl || null; // string ou null
  }

  const updatedParent = await this.parentRepository.save(parent);

  return {
    success: true,
    message: 'Parent modifié avec succès',
    data: {
      id: updatedParent.id,
      fullName: updatedParent.fullName,
      phone: updatedParent.phone,
      updatedAt: updatedParent.updatedAt
    }
  };
}

  /**
   * Supprimer un parent
   */
  async remove(id: number) {
    const parent = await this.parentRepository.findOne({
      where: { id },
      relations: ['studentsAsParent1', 'studentsAsParent2']
    });

    if (!parent) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'PARENT_NOT_FOUND',
          message: 'Parent non trouvé'
        }
      });
    }

    // Vérifier si le parent a des enfants
    const totalChildren = (parent.studentsAsParent1?.length || 0) + (parent.studentsAsParent2?.length || 0);
    
    if (totalChildren > 0) {
      throw new BadRequestException({
        success: false,
        error: {
          code: 'PARENT_HAS_CHILDREN',
          message: 'Impossible de supprimer ce parent car il a des enfants associés',
          details: {
            childrenCount: totalChildren
          }
        }
      });
    }

    await this.parentRepository.remove(parent);

    return {
      success: true,
      message: 'Parent supprimé avec succès',
      data: {
        id: parent.id,
        fullName: parent.fullName
      }
    };
  }

  /**
   * Réinitialiser le mot de passe d'un parent
   */
  async resetPassword(id: number) {
    const parent = await this.parentRepository.findOne({ where: { id } });

    if (!parent) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'PARENT_NOT_FOUND',
          message: 'Parent non trouvé'
        }
      });
    }

    // Générer un nouveau mot de passe
    const newPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    parent.password = hashedPassword;
    await this.parentRepository.save(parent);

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      data: {
        id: parent.id,
        fullName: parent.fullName,
        newPassword: newPassword // À partager avec le parent
      }
    };
  }
}
// src/auth/auth.service.ts
import { 
  Injectable, 
  UnauthorizedException, 
  NotFoundException,
  Logger 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Parent } from '../admin/parents/entities/parent.entity';
import { Driver } from '../admin/drivers/entities/driver.entity';
import { LoginDto } from './dto/login.dto';
import { Bus } from 'src/admin/buses/entities/bus.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,

     @InjectRepository(Bus)
    private readonly busRepository: Repository<Bus>,
    
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Authentification unique pour parent et driver
   * Recherche hiérarchique: d'abord parent, puis driver
   */
  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    this.logger.log(`Tentative de connexion pour le téléphone: ${phone}`);

    let user: any = null;
    let role: string = '';
    let userDetails: any = {};

    // 1. Recherche dans la table Parent
    user = await this.parentRepository.findOne({
      where: { phone },
      relations: ['studentsAsParent1', 'studentsAsParent2']
    });

    if (user) {
      role = 'parent';
      userDetails = {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        sexe: user.sexe,
        photoUrl: user.photoUrl,
        createdAt: user.createdAt,
        totalChildren: (user.studentsAsParent1?.length || 0) + (user.studentsAsParent2?.length || 0)
         
      };
      this.logger.log(`Parent trouvé: ${user.fullName}`);
    } else {
      // 2. Recherche dans la table Driver
      user = await this.driverRepository.findOne({
        where: { phone },
        relations: ['assignedBus', 'school']
      });

      if (user) {
        role = 'driver';
        userDetails = {
          id: user.id,
          fullName: user.full_name,
          phone: user.phone,
          createdAt: user.created_at,
          hasAssignedBus: !!user.assignedBus,
          assignedBus: user.assignedBus ? {
            id: user.assignedBus.id,
            licencePlate: user.assignedBus.licence_plate,
            capacity: user.assignedBus.capacity
          } : null,
          school: user.school ? {
            id: user.school.id,
            name: user.school.name
          } : null
        };
        this.logger.log(`Driver trouvé: ${user.full_name}`);
      }
    }

    // 3. Si non trouvé dans les deux tables
    if (!user) {
      this.logger.warn(`Aucun utilisateur trouvé avec le téléphone: ${phone}`);
      throw new NotFoundException('Aucun compte trouvé avec ce numéro de téléphone');
    }

    // 4. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      this.logger.warn(`Mot de passe incorrect pour: ${phone}`);
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    // 5. Préparer le payload pour le JWT (selon votre format actuel)
    const payload = {
      phone: user.phone,
      role: role,
      userId: user.id,
      userType: role,
      ...(role === 'parent' && { full_name: user.fullName }),
      ...(role === 'driver' && { full_name: user.full_name })
    };

    // 6. Générer les tokens selon votre configuration actuelle
    const access_token = this.jwtService.sign(payload, {
      secret: 'ACCESS_SECRET',
      expiresIn: '2m',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: 'REFRESH_SECRET',
      expiresIn: '60m',
    });

    // 7. Hasher et stocker le refresh token (comme dans votre code actuel)
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    
    // Ici, normalement vous devriez stocker le refresh token dans la base de données
    // Pour l'instant, on le garde en mémoire comme dans votre code
    // À adapter selon votre modèle de stockage

    this.logger.log(`Connexion réussie pour: ${phone} (${role})`);

    return {
      message: "Connexion réussie",
      access_token,
      refresh_token,
      user: userDetails
    };
  }

  /**
   * Rafraîchir le token (identique à votre code actuel)
   */
  async refresh(refreshToken: string) {
    try {
      // 1️⃣ Vérifier la signature
      const payload = this.jwtService.verify(refreshToken, {
        secret: 'REFRESH_SECRET',
      });

      // 2️⃣ Ici, normalement vous récupéreriez l'utilisateur depuis la DB
      // Pour l'instant, on simule comme dans votre code
      const user = {
        phone: payload.phone,
        role: payload.role,
        userId: payload.userId
      };

      // 3️⃣ Vérifier que le refresh token est valide
      // Dans votre implémentation réelle, vous vérifieriez dans la DB
      // Pour l'instant, on accepte le token

      // 4️⃣ Générer nouveaux tokens
      const newAccessToken = this.jwtService.sign({
        phone: user.phone,
        role: user.role,
        userId: user.userId
      }, {
        secret: 'ACCESS_SECRET',
        expiresIn: '2m',
      });

      const newRefreshToken = this.jwtService.sign({
        phone: user.phone,
        role: user.role,
        userId: user.userId
      }, {
        secret: 'REFRESH_SECRET',
        expiresIn: '5m',
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };

    } catch (error) {
      this.logger.error('Erreur lors du refresh token:', error);
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  /**
   * Récupérer les informations du profil
   */
async info(user: any) {
  const { phone, role, userId } = user;
  
  let userDetails: any = {};
  
  if (role === 'parent') {
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
        'studentsAsParent2.bus.school'
      ]
    });

    if (parent) {
      // Fusionner tous les enfants des deux parents
      const allStudents = [
        ...(parent.studentsAsParent1 || []),
        ...(parent.studentsAsParent2 || [])
      ];
      
      // Map pour regrouper les enfants par bus
      const childrenByBus = new Map<number, {
        bus: any;
        children: any[];
      }>();
      
      // Organiser les enfants par bus
      allStudents.forEach(student => {
        if (student.bus) {
          const busId = student.bus.id;
          
          if (!childrenByBus.has(busId)) {
            childrenByBus.set(busId, {
              bus: {
                id: student.bus.id,
                licencePlate: student.bus.licence_plate,
                capacity: student.bus.capacity,
                photoUrl: student.bus.photo_url || null,
                isActive: student.bus.is_active,
                school: student.bus.school ? {
                  id: student.bus.school.id,
                  name: student.bus.school.name,
                  address: student.bus.school.address,
                  latitude: student.bus.school.geom?.coordinates?.[1] || null, // latitude
                  longitude: student.bus.school.geom?.coordinates?.[0] || null // longitude   
                } : null
              },
              children: []
            });
          }
          
          // Vérifier que childrenByBus.get(busId) n'est pas undefined
          const busGroup = childrenByBus.get(busId);
          if (busGroup) {
            busGroup.children.push({
              id: student.id,
              name: student.fullName,
              stop: student.stop ? student.stop.address : 'Arrêt non défini',
              qrCode: student.qrCode
            });
          }
        } else {
          // Enfant sans bus assigné
          const noBusKey = 0; // Clé spéciale pour les enfants sans bus
          if (!childrenByBus.has(noBusKey)) {
            childrenByBus.set(noBusKey, {
              bus: null,
              children: []
            });
          }
          
          const noBusGroup = childrenByBus.get(noBusKey);
          if (noBusGroup) {
            noBusGroup.children.push({
              id: student.id,
              name: student.fullName,
              stop: student.stop ? student.stop.address : 'Arrêt non défini',
              qrCode: student.qrCode,
              bus: null
            });
          }
        }
      });
      
      // Convertir Map en array (exclure les enfants sans bus)
      const busesArray = Array.from(childrenByBus.entries())
        .filter(([key, group]) => key !== 0 && group.bus !== null)
        .map(([key, group]) => group);
      
      // Récupérer les enfants sans bus
      const childrenWithoutBus = childrenByBus.get(0)?.children || [];
      
      // Formater la liste complète des enfants
      const childrenList = allStudents.map(student => ({
        id: student.id,
        name: student.fullName,
        bus: student.bus ? {
          id: student.bus.id,
          licencePlate: student.bus.licence_plate,
          capacity: student.bus.capacity,
          photoUrl: student.bus.photo_url || null,
          isActive: student.bus.is_active,
            school: student.bus.school ? {
          id: student.bus.school.id,
          name: student.bus.school.name,
          address: student.bus.school.address,
          latitude: student.bus.school.geom?.coordinates?.[1] || null,
          longitude: student.bus.school.geom?.coordinates?.[0] || null
        } : null
        } : null,
        busText: student.bus ? `Bus ${student.bus.licence_plate}` : 'Non assigné',
        stop: student.stop ? student.stop.address : 'Arrêt non défini',
        qrCode: student.qrCode
      }));
      
      // Calculer les statistiques des bus
      const uniqueBusIds = [...new Set(
        allStudents
          .filter(student => student.bus)
          .map(student => student.bus.id)
      )];
      
      const allInSameBus = uniqueBusIds.length === 1;
      const hasMultipleBuses = uniqueBusIds.length > 1;
      const hasNoBusAssigned = childrenWithoutBus.length > 0;
      
      // Texte résumé pour le bus
      let busSummary = '';
      if (allInSameBus && busesArray.length > 0 && busesArray[0]) {
        busSummary = `Bus ${busesArray[0].bus.licencePlate}`;
      } else if (hasMultipleBuses) {
        busSummary = `${busesArray.length} bus différents`;
      } else if (hasNoBusAssigned) {
        busSummary = 'Non assigné';
      } else {
        busSummary = 'Aucun bus';
      }
      
      userDetails = {
        name: parent.fullName,
        phone: parent.phone,
        children: childrenList,
        childrenCount: allStudents.length,
        
        // Statistiques des bus
        allInSameBus: allInSameBus,
        hasMultipleBuses: hasMultipleBuses,
        hasNoBusAssigned: hasNoBusAssigned,
        totalBuses: busesArray.length,
        
        // Bus unique (si tous dans le même bus)
        bus: allInSameBus && busesArray.length > 0 ? busesArray[0].bus : null,
        busText: busSummary,
        
        // Liste de tous les bus avec leurs enfants
        buses: busesArray.map(busGroup => ({
          bus: busGroup.bus,
          children: busGroup.children,
          childrenCount: busGroup.children.length
        })),
        
        // Enfants sans bus
        childrenWithoutBus: childrenWithoutBus,
        
        role: 'parent',
        totalChildren: allStudents.length,
        photoUrl: parent.photoUrl || null,
        sexe: parent.sexe === true ? 'Homme' : (parent.sexe === false ? 'Femme' : 'Non spécifié'),
        createdAt: parent.createdAt,
        
        // Informations de l'école (si tous les enfants vont à la même école)
          school: busesArray.length > 0 && busesArray[0]?.bus?.school 
          ? busesArray[0].bus.school 
          : null
      };
    }
  } else if (role === 'driver') {
    const driver = await this.driverRepository.findOne({
      where: { id: userId },
      relations: [
        'assignedBus',
        'assignedBus.school',
        'school'
      ]
    });
    
    if (driver) {
      // Récupérer les étudiants assignés à ce bus
      let studentsInBus: any[] = [];
      let busDetails: any = null;
      
      if (driver.assignedBus) {
        const busWithStudents = await this.busRepository.findOne({
          where: { id: driver.assignedBus.id },
          relations: [
            'students', 
            'students.stop', 
            'students.parent1', 
            'students.parent2',
            'school'
          ]
        });
        
        if (busWithStudents) {
          busDetails = {
            id: busWithStudents.id,
            licencePlate: busWithStudents.licence_plate,
            capacity: busWithStudents.capacity,
            photoUrl: busWithStudents.photo_url || null,
            isActive: busWithStudents.is_active,
            school: busWithStudents.school ? {
              id: busWithStudents.school.id,
              name: busWithStudents.school.name,
              address: busWithStudents.school.address,
               latitude: busWithStudents.school.geom?.coordinates?.[1] || null,
              longitude: busWithStudents.school.geom?.coordinates?.[0] || null
            } : null
          };
          
          if (busWithStudents.students) {
            studentsInBus = busWithStudents.students.map(student => ({
              id: student.id,
              name: student.fullName,
              stop: student.stop ? student.stop.address : 'Non défini',
              parent1: student.parent1 ? {
                id: student.parent1.id,
                name: student.parent1.fullName,
                phone: student.parent1.phone
              } : null,
              parent2: student.parent2 ? {
                id: student.parent2.id,
                name: student.parent2.fullName,
                phone: student.parent2.phone
              } : null,
              qrCode: student.qrCode
            }));
          }
        }
      }
      
      userDetails = {
        name: driver.full_name,
        phone: driver.phone,
        childrenCount: studentsInBus.length,
        children: studentsInBus,
        bus: driver.assignedBus ? 
          `Bus ${driver.assignedBus.licence_plate} (${driver.assignedBus.capacity} places)` : 
          'Non assigné',
        assignedBus: busDetails,
        school: driver.school ? {
          id: driver.school.id,
          name: driver.school.name,
          address: driver.school.address,
           latitude: driver.school.geom?.coordinates?.[1] || null,
          longitude: driver.school.geom?.coordinates?.[0] || null
        } : null,
        role: 'chauffeur',
        hasAssignedBus: !!driver.assignedBus,
        createdAt: driver.created_at,
        
        // Statistiques pour le chauffeur
        busCapacity: driver.assignedBus ? driver.assignedBus.capacity : 0,
        availableSeats: driver.assignedBus ? 
          driver.assignedBus.capacity - studentsInBus.length : 
          0,
        isBusFull: driver.assignedBus ? 
          studentsInBus.length >= driver.assignedBus.capacity : 
          false
      };
    }
  }

  return {
    message: "Info recupere avec succes",
    profil: userDetails
  };
}


// Méthode helper pour obtenir l'école commune


  /**
   * Vérifier les informations de connexion (méthode utilitaire)
   */
  async validateUser(phone: string, password: string): Promise<any> {
    let user: any = null;

    // Recherche dans Parent
    user = await this.parentRepository.findOne({ where: { phone } });
    
    if (!user) {
      // Recherche dans Driver
      user = await this.driverRepository.findOne({ where: { phone } });
    }

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return {
        ...result,
        role: user.full_name ? 'driver' : 'parent' // Simple détection du rôle
      };
    }
    
    return null;
  }
}
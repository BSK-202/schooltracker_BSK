// src/parents/entities/parent.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { NotificationToken } from 'src/notifications/entities/notification-token.entity';

@Entity('parent')
export class Parent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    name: 'full_name',
    type: 'varchar',
    length: 255 
  })
  fullName: string;

  @Column({ 
    name: 'phone',
    type: 'varchar',
    length: 20,
    unique: true 
  })
  phone: string;

  @Column({ 
    name: 'sexe',
    type: 'boolean',
    nullable: true 
  })
  sexe: boolean | null;

  @Column({ 
    name: 'password',
    type: 'varchar',
    length: 255 
  })
  password: string;

  @Column({ 
    name: 'photo_url',
    type: 'varchar',
    length: 500,
    nullable: true 
  })
  photoUrl: string | null;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp' 
  })
  createdAt: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp' 
  })
  updatedAt: Date;

  @OneToMany(() => Student, (student) => student.parent1)
  studentsAsParent1: Student[];

  @OneToMany(() => Student, (student) => student.parent2)
  studentsAsParent2: Student[];

  // Ajoutez cette relation pour les tokens de notification
  @OneToMany(() => NotificationToken, (token) => token.parent)
  notificationTokens: NotificationToken[];
}
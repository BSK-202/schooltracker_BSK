// src/students/entities/student.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Parent } from '../../parents/entities/parent.entity';
import { Stop } from 'src/admin/stops/entities/stop.entity';

@Entity('student')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    name: 'full_name',
    type: 'varchar',
    length: 255 
  })
  fullName: string;

  @Column({ 
    name: 'qr_code',
    type: 'varchar',
    length: 100,  // ← AJOUTEZ UNE LONGUEUR
    unique: true 
  })
  qrCode: string;

  @Column({ 
    name: 'photo_url',
    type: 'varchar',
    length: 500,  // ← AJOUTEZ UNE LONGUEUR
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

  // Relations
  @ManyToOne(() => Parent, { nullable: true })
  @JoinColumn({ name: 'parent1_id' })
  parent1: Parent | null;

  @ManyToOne(() => Parent, { nullable: true })
  @JoinColumn({ name: 'parent2_id' })
  parent2: Parent | null;

  @ManyToOne(() => Stop, { nullable: false })
  @JoinColumn({ name: 'stop_id' })
  stop: Stop;
}
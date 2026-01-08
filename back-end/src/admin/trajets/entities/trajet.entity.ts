// src/admin/trajets/entities/trajet.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { Bus } from '../../buses/entities/bus.entity';
import { TrajetStop } from './trajet-stop.entity';

export enum TypeTrajet {
  PICKUP = 'PICKUP',
  DROPOFF = 'DROPOFF'
}

@Entity('trajet')
export class Trajet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({
    type: 'enum',
    enum: TypeTrajet,
    default: TypeTrajet.PICKUP
  })
  type: TypeTrajet;

  @Column({ name: 'is_actif', default: true })
  is_actif: boolean;

  @Column({ type: 'time', name: 'heure_debut' })
  heure_debut: string;

  @Column({ type: 'time', name: 'heure_fin' })
  heure_fin: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Bus, (bus) => bus.trajets, { 
    nullable: false,
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;

  @OneToMany(() => TrajetStop, (trajetStop) => trajetStop.trajet, { 
    cascade: true 
  })
  trajetStops: TrajetStop[];
}
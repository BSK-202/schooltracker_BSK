// src/admin/trajets/entities/trajet-stop.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique
} from 'typeorm';
import { Trajet } from './trajet.entity';
import { Stop } from '../../stops/entities/stop.entity';

@Entity('trajet_stop')
@Unique(['trajet', 'stop_order'])
export class TrajetStop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stop_order' })
  stop_order: number;

  @Column({ type: 'time', name: 'scheduled_time' })
  scheduled_time: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Trajet, (trajet) => trajet.trajetStops, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'trajet_id' })
  trajet: Trajet;

  @ManyToOne(() => Stop, (stop) => stop.trajetStops, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'stop_id' })
  stop: Stop;
}
// src/admin/buses/entities/bus.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne, 
  OneToOne, 
  OneToMany, 
  JoinColumn 
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Trajet } from '../../trajets/entities/trajet.entity';
import { Stop } from '../../stops/entities/stop.entity'; // AJOUTER CET IMPORT

@Entity('bus')
export class Bus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  licence_plate: string;

  @Column()
  capacity: number;

  @Column({ nullable: true })
  photo_url: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => School, (school) => school.buses, { nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @OneToOne(() => Driver, (driver) => driver.assignedBus, { nullable: false })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @OneToMany(() => Trajet, (trajet) => trajet.bus)
  trajets: Trajet[];
}
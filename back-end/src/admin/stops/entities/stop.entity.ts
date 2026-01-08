// src/admin/stops/entities/stop.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Point } from 'geojson';
import { TrajetStop } from '../../trajets/entities/trajet-stop.entity';

@Entity('stop')
export class Stop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'address' })
  address: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: false
  })
  geom: Point;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => TrajetStop, (trajetStop) => trajetStop.stop)
  trajetStops: TrajetStop[];
}
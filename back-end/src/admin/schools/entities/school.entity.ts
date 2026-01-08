import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Point } from 'geojson';
import { Bus } from 'src/admin/buses/entities/bus.entity';
import { Driver } from 'src/admin/drivers/entities/driver.entity';

@Entity('ecole')
export class School {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: false
  })
  geom: Point;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

   @OneToMany(() => Bus, (bus) => bus.school)
  buses: Bus[];
  
  @OneToMany(() => Driver, (driver) => driver.school)
  drivers: Driver[];
}
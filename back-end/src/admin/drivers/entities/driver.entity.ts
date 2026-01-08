import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Bus } from '../../buses/entities/bus.entity';
import { School } from '../../schools/entities/school.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  full_name: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;  // hashé

  @CreateDateColumn()
  created_at: Date;

  // Relation One-to-One avec Bus (Un chauffeur ↔ Un bus)
  @OneToOne(() => Bus, (bus) => bus.driver, { nullable: true })
  assignedBus: Bus | null;

  // Relation Many-to-One avec School (Plusieurs chauffeurs → Une école) ← NOUVEAU
  @ManyToOne(() => School, (school) => school.drivers, { nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: School;
}
// src/notifications/entities/notification-token.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne, 
  Index 
} from 'typeorm';
import { Parent } from '../../admin/parents/entities/parent.entity';

@Entity('notification_tokens')
export class NotificationToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ unique: true })
  pushToken: string;

  @ManyToOne(() => Parent, parent => parent.notificationTokens, { 
    nullable: false,
    onDelete: 'CASCADE' // Supprimer les tokens si le parent est supprimé
  })
  parent: Parent;

  @Column({ 
    name: 'is_active',
    default: true 
  })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ 
    name: 'last_used',
    nullable: true 
  })
  lastUsed: Date;
}
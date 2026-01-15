// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationToken } from './entities/notification-token.entity';
import { Parent } from '../admin/parents/entities/parent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationToken, Parent])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // Important pour l'utiliser dans d'autres modules
})
export class NotificationsModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationScheduler } from './notification.scheduler';
import { Notification } from '../../database/entities/notification.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { User } from '../../database/entities/user.entity';
import { Lead } from '../../database/entities/lead.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, CarInsurance, User, Lead])
  ],
  providers: [NotificationService, NotificationScheduler],
  controllers: [NotificationController],
  exports: [NotificationService]
})
export class NotificationModule {}
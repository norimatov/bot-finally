import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(private notificationService: NotificationService) {}

  @Cron('0 8 * * *')
  async handleMorningCheck() {
    this.logger.log('Running morning notification check...');
    await this.notificationService.checkExpiringInsurances();
  }

  @Cron('0 14 * * *')
  async handleAfternoonCheck() {
    this.logger.log('Running afternoon notification check...');
    await this.notificationService.checkExpiringInsurances();
  }

  @Cron('0 20 * * *')
  async handleEveningCheck() {
    this.logger.log('Running evening notification check...');
    await this.notificationService.checkExpiringInsurances();
  }

  @Cron('0 3 * * *')
  async handleCleanup() {
    this.logger.log('Running notification cleanup...');
    const deleted = await this.notificationService.deleteOldNotifications();
    this.logger.log(`Deleted ${deleted} old notifications`);
  }
}
import { Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from '../../database/entities/notification.entity';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string): Promise<Notification[]> {
    return this.notificationService.getUserNotifications(parseInt(userId));
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string): Promise<void> {
    return this.notificationService.markAsRead(parseInt(id));
  }

  @Post('user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string): Promise<void> {
    return this.notificationService.markAllAsRead(parseInt(userId));
  }

  @Delete('clean')
  async deleteOldNotifications(): Promise<{ deleted: number }> {
    const deleted = await this.notificationService.deleteOldNotifications();
    return { deleted };
  }
}
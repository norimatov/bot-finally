import { NotificationService } from './notification.service';
import { Notification } from '../../database/entities/notification.entity';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getUserNotifications(userId: string): Promise<Notification[]>;
    markAsRead(id: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteOldNotifications(): Promise<{
        deleted: number;
    }>;
}

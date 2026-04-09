import { NotificationService } from './notification.service';
export declare class NotificationScheduler {
    private notificationService;
    private readonly logger;
    constructor(notificationService: NotificationService);
    handleMorningCheck(): Promise<void>;
    handleAfternoonCheck(): Promise<void>;
    handleEveningCheck(): Promise<void>;
    handleCleanup(): Promise<void>;
}

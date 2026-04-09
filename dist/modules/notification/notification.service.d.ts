import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { User } from '../../database/entities/user.entity';
import { Lead } from '../../database/entities/lead.entity';
export declare class NotificationService {
    private notifRepo;
    private insuranceRepo;
    private userRepo;
    private leadRepo;
    private readonly logger;
    constructor(notifRepo: Repository<Notification>, insuranceRepo: Repository<CarInsurance>, userRepo: Repository<User>, leadRepo: Repository<Lead>);
    checkExpiringInsurances(): Promise<void>;
    private createNotificationsForInsurance;
    createNotification(userId: number, message: string, type: string): Promise<Notification>;
    getUserNotifications(userId: number): Promise<Notification[]>;
    markAsRead(id: number): Promise<void>;
    markAllAsRead(userId: number): Promise<void>;
    deleteOldNotifications(days?: number): Promise<number>;
}

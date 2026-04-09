import { User } from './user.entity';
export declare class Notification {
    id: number;
    user: User;
    userId: number;
    telegramId: bigint;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    sentAt: Date;
    deliveredAt: Date;
}

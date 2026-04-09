import { User } from './user.entity';
export declare class DailyStat {
    id: number;
    user: User;
    userId: number;
    date: Date;
    carsAdded: number;
    leadsClosed: number;
    totalEarned: number;
    createdAt: Date;
    updatedAt: Date;
}

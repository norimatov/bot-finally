import { User } from './user.entity';
export declare class Kpi {
    id: number;
    user: User;
    userId: number;
    actionType: string;
    points: number;
    amount: number;
    referenceId: number;
    referenceType: string;
    createdAt: Date;
}

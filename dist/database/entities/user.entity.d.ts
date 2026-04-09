import { Car } from './car.entity';
import { Kpi } from './kpi.entity';
import { Lead } from './lead.entity';
import { Notification } from './notification.entity';
import { DailyStat } from './daily-stat.entity';
export declare class User {
    id: number;
    telegramId: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    cars: Car[];
    kpis: Kpi[];
    leads: Lead[];
    notifications: Notification[];
    dailyStats: DailyStat[];
}

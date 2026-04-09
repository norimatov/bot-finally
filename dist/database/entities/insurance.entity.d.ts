import { Car } from './car.entity';
import { User } from './user.entity';
import { Lead } from './lead.entity';
export declare class CarInsurance {
    id: number;
    car: Car;
    carId: number;
    policyNumber: string;
    startDate: Date;
    endDate: Date;
    type: string;
    insuranceType: string;
    amount: number;
    status: string;
    createdBy: User;
    createdById: number;
    createdAt: Date;
    updatedAt: Date;
    leads: Lead[];
}

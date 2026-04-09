import { InsuranceService } from './insurance.service';
import { CarInsurance } from '../../database/entities/insurance.entity';
export declare class InsuranceController {
    private readonly insuranceService;
    constructor(insuranceService: InsuranceService);
    findAll(): Promise<CarInsurance[]>;
    getActive(): Promise<CarInsurance[]>;
    getExpiring(days: string): Promise<CarInsurance[]>;
    getExpired(): Promise<CarInsurance[]>;
    getStats(): Promise<any>;
    findOne(id: string): Promise<CarInsurance>;
    findByCar(carId: string): Promise<CarInsurance[]>;
    updateStatus(id: string, status: string): Promise<CarInsurance>;
}

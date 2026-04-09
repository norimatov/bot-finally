import { DataSource, Repository } from 'typeorm';
import { CarInsurance } from '../entities/insurance.entity';
export declare class InsuranceRepository extends Repository<CarInsurance> {
    private dataSource;
    constructor(dataSource: DataSource);
    findActive(): Promise<CarInsurance[]>;
    findExpiring(days: number): Promise<CarInsurance[]>;
    findByCar(carId: number): Promise<CarInsurance[]>;
}

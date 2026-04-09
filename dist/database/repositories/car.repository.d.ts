import { DataSource, Repository } from 'typeorm';
import { Car } from '../entities/car.entity';
export declare class CarRepository extends Repository<Car> {
    private dataSource;
    constructor(dataSource: DataSource);
    findByPlate(plate: string): Promise<Car>;
    findByUser(userId: number): Promise<Car[]>;
}

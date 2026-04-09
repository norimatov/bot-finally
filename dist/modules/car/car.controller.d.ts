import { CarService } from './car.service';
import { Car } from '../../database/entities/car.entity';
export declare class CarController {
    private readonly carService;
    constructor(carService: CarService);
    findAll(): Promise<Car[]>;
    getTodayCount(): Promise<{
        count: number;
    }>;
    getMonthCount(): Promise<{
        count: number;
    }>;
    findOne(id: string): Promise<Car>;
    findByPlate(plateNumber: string): Promise<Car>;
    findByUser(userId: string): Promise<Car[]>;
}

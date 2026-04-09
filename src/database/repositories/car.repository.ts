import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Car } from '../entities/car.entity';

@Injectable()
export class CarRepository extends Repository<Car> {
  constructor(private dataSource: DataSource) {
    super(Car, dataSource.createEntityManager());
  }

  async findByPlate(plate: string): Promise<Car> {
    return this.findOne({ 
      where: { plateNumber: plate },
      relations: ['insurances']
    });
  }

  async findByUser(userId: number): Promise<Car[]> {
    return this.find({
      where: { createdById: userId },
      relations: ['insurances'],
      order: { createdAt: 'DESC' }
    });
  }
}
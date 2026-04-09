import { Injectable } from '@nestjs/common';
import { DataSource, Repository, LessThan } from 'typeorm';
import { CarInsurance } from '../entities/insurance.entity';
import { DateUtil } from '../../common/utils/date.util';

@Injectable()
export class InsuranceRepository extends Repository<CarInsurance> {
  constructor(private dataSource: DataSource) {
    super(CarInsurance, dataSource.createEntityManager());
  }

  async findActive(): Promise<CarInsurance[]> {
    return this.find({
      where: { status: 'active' },
      relations: ['car']
    });
  }

  async findExpiring(days: number): Promise<CarInsurance[]> {
    const targetDate = DateUtil.getDateRange(days);
    
    return this.find({
      where: {
        endDate: LessThan(targetDate),
        status: 'active'
      },
      relations: ['car']
    });
  }

  async findByCar(carId: number): Promise<CarInsurance[]> {
    return this.find({
      where: { carId: carId },
      order: { createdAt: 'DESC' }
    });
  }
}
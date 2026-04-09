import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { Car } from '../../database/entities/car.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarInsurance, Car])
  ],
  providers: [InsuranceService],
  controllers: [InsuranceController],
  exports: [InsuranceService]
})
export class InsuranceModule {}
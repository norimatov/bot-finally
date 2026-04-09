// src/modules/car/car.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../../database/entities/car.entity';
import { CarInsurance } from '../../database/entities/insurance.entity'; // IMPORT QILISH
import { CarService } from './car.service';
import { CarController } from './car.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Car, 
      CarInsurance  // CarInsurance ni qo'shish
    ])
  ],
  providers: [CarService],
  controllers: [CarController],
  exports: [TypeOrmModule, CarService] // TypeOrmModule ni eksport qilish MUHIM!
})
export class CarModule {}
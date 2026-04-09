import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../../database/entities/user.entity';
import { Car } from '../../database/entities/car.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { Lead } from '../../database/entities/lead.entity';
import { Kpi } from '../../database/entities/kpi.entity';
import { DailyStat } from '../../database/entities/daily-stat.entity';
import { KpiModule } from '../kpi/kpi.module';
import { ExcelService } from '../../shared/exel/exel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Car, CarInsurance, Lead, Kpi, DailyStat]),
    KpiModule
  ],
  providers: [AdminService, ExcelService],
  controllers: [AdminController],
  exports: [AdminService]
})
export class AdminModule {}
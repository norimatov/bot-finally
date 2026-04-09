import { Controller, Get, Param, Put } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { CarInsurance } from '../../database/entities/insurance.entity';

@Controller('insurances')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Get()
  async findAll(): Promise<CarInsurance[]> {
    return this.insuranceService.findAll();
  }

  @Get('active')
  async getActive(): Promise<CarInsurance[]> {
    return this.insuranceService.getActive();
  }

  @Get('expiring/:days')
  async getExpiring(@Param('days') days: string): Promise<CarInsurance[]> {
    return this.insuranceService.getExpiring(parseInt(days));
  }

  @Get('expired')
  async getExpired(): Promise<CarInsurance[]> {
    return this.insuranceService.getExpired();
  }

  @Get('stats')
  async getStats(): Promise<any> {
    return this.insuranceService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CarInsurance> {
    return this.insuranceService.findOne(parseInt(id));
  }

  @Get('car/:carId')
  async findByCar(@Param('carId') carId: string): Promise<CarInsurance[]> {
    return this.insuranceService.findByCar(parseInt(carId));
  }

  @Put(':id/status/:status')
  async updateStatus(
    @Param('id') id: string,
    @Param('status') status: string
  ): Promise<CarInsurance> {
    return this.insuranceService.updateStatus(parseInt(id), status);
  }
}
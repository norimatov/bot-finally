import { Controller, Get, Param } from '@nestjs/common';
import { CarService } from './car.service';
import { Car } from '../../database/entities/car.entity';

@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get()
  async findAll(): Promise<Car[]> {
    return this.carService.findAll();
  }

  @Get('today')
  async getTodayCount(): Promise<{ count: number }> {
    const count = await this.carService.getTodayCount();
    return { count };
  }

  @Get('month')
  async getMonthCount(): Promise<{ count: number }> {
    const count = await this.carService.getMonthCount();
    return { count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Car> {
    return this.carService.findOne(parseInt(id));
  }

  @Get('plate/:plateNumber')
  async findByPlate(@Param('plateNumber') plateNumber: string): Promise<Car> {
    return this.carService.findByPlate(plateNumber);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string): Promise<Car[]> {
    return this.carService.findByUser(parseInt(userId));
  }
}
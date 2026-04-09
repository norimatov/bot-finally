import { Controller, Get, Param } from '@nestjs/common';
import { KpiService } from './kpi.service';

@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Get('user/:userId')
  async getUserStats(@Param('userId') userId: string) {
    const [today, month] = await Promise.all([
      this.kpiService.getTodayStats(parseInt(userId)),
      this.kpiService.getMonthStats(parseInt(userId))
    ]);
    
    return { today, month };
  }

  @Get('rating')
  async getRating() {
    return this.kpiService.getUserRating();
  }
}
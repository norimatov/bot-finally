import { Controller, Get, Post, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats/today')
  async getTodayStats() {
    return this.adminService.getTodayStats();
  }

  @Get('stats/month')
  async getMonthStats() {
    return this.adminService.getMonthStats();
  }

  @Get('rating')
  async getUserRating() {
    return this.adminService.getUserRating();
  }

  @Get('payments')
  async getPayments() {
    return this.adminService.getPayments();
  }

  @Get('user/:userId')
  async getUserStats(@Param('userId') userId: string) {
    return this.adminService.getUserStats(parseInt(userId));
  }

  @Get('export')
  async exportExcel(@Query('type') type: string, @Res() res: Response) {
    const buffer = await this.adminService.exportToExcel(type);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }
}
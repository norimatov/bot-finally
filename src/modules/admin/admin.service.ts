import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Car } from '../../database/entities/car.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { Lead } from '../../database/entities/lead.entity';
import { Kpi } from '../../database/entities/kpi.entity';
import { DailyStat } from '../../database/entities/daily-stat.entity';
import { DateUtil } from '../../common/utils/date.util';
import { KPI } from '../../common/constants/kpi.constants';
import { ExcelService } from '../../shared/exel/exel.service';
import { KpiService } from '../kpi/kpi.service'; // IMPORT QILINDI

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Car) private carRepo: Repository<Car>,
    @InjectRepository(CarInsurance) private insuranceRepo: Repository<CarInsurance>,
    @InjectRepository(Lead) private leadRepo: Repository<Lead>,
    @InjectRepository(Kpi) private kpiRepo: Repository<Kpi>,
    @InjectRepository(DailyStat) private dailyStatRepo: Repository<DailyStat>,
    private excelService: ExcelService,
    private kpiService: KpiService, // QO'SHILDI
  ) {}

  async getTodayStats(): Promise<any> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      carsCount,
      insurancesCount,
      leadsCount,
      dailyStats,
      kpis
    ] = await Promise.all([
      this.carRepo.count({ where: { createdAt: Between(today, tomorrow) } }),
      this.insuranceRepo.count({ where: { createdAt: Between(today, tomorrow) } }),
      this.leadRepo.count({ where: { createdAt: Between(today, tomorrow) } }),
      this.dailyStatRepo.find({ 
        where: { date: today },
        relations: ['user']
      }),
      this.kpiRepo.find({ where: { createdAt: Between(today, tomorrow) } })
    ]);

    const totalKpi = kpis.reduce((sum, k) => sum + Number(k.amount), 0);
    const totalCars = dailyStats.reduce((sum, d) => sum + d.carsAdded, 0);
    const totalLeads = dailyStats.reduce((sum, d) => sum + d.leadsClosed, 0);

    return {
      date: today,
      carsAdded: carsCount,
      insurancesAdded: insurancesCount,
      leadsCreated: leadsCount,
      totalKpi,
      totalCars,
      totalLeads,
      dailyStats
    };
  }

  async getMonthStats(): Promise<any> {
    const monthStart = DateUtil.getMonthStart();
    const today = new Date();

    const dailyStats = await this.dailyStatRepo.find({
      where: { date: Between(monthStart, today) },
      relations: ['user'],
      order: { date: 'DESC' }
    });

    const totalCars = dailyStats.reduce((sum, d) => sum + d.carsAdded, 0);
    const totalLeads = dailyStats.reduce((sum, d) => sum + d.leadsClosed, 0);
    const totalEarned = dailyStats.reduce((sum, d) => sum + Number(d.totalEarned), 0);

    return {
      totalCars,
      totalLeads,
      totalEarned,
      daily: dailyStats
    };
  }

  async getUserRating(): Promise<any[]> {
    const users = await this.userRepo.find({
      where: { isActive: true },
      relations: ['kpis']
    });

    const monthStart = DateUtil.getMonthStart();

    const rating = users.map(user => {
      const monthKpis = user.kpis?.filter(k => 
        new Date(k.createdAt) >= monthStart
      ) || [];

      const carsAdded = monthKpis.filter(k => k.actionType === KPI.actions.addCar).length;
      const leadsClosed = monthKpis.filter(k => k.actionType === KPI.actions.closeLead).length;
      const totalEarned = monthKpis.reduce((sum, k) => sum + Number(k.amount), 0);

      let amount = 0;
      if (user.role === 'registrar') {
        amount = carsAdded * KPI.registrar.perCar;
      } else if (user.role === 'operator') {
        amount = totalEarned;
      }

      return {
        id: user.id,
        name: user.firstName || user.username || 'No name',
        role: user.role,
        carsAdded,
        leadsClosed,
        totalEarned: amount,
        phone: user.phone,
        username: user.username
      };
    }).sort((a, b) => b.totalEarned - a.totalEarned)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
      }));

    return rating;
  }

  async getPayments(): Promise<any[]> {
    const users = await this.userRepo.find({
      where: { isActive: true },
      relations: ['kpis']
    });

    const monthStart = DateUtil.getMonthStart();
    const monthEnd = DateUtil.getMonthEnd();

    return users.map(user => {
      const monthKpis = user.kpis?.filter(k => 
        new Date(k.createdAt) >= monthStart && new Date(k.createdAt) <= monthEnd
      ) || [];

      const totalEarned = monthKpis.reduce((sum, k) => sum + Number(k.amount), 0);

      return {
        userId: user.id,
        name: user.firstName || user.username,
        role: user.role,
        phone: user.phone,
        amount: totalEarned,
        period: {
          start: monthStart,
          end: monthEnd
        },
        status: 'pending'
      };
    }).filter(p => p.amount > 0);
  }

  async exportToExcel(type: string): Promise<Buffer> {
    let data: any[] = [];
    
    if (type === 'users') {
      data = await this.getUserRating();
    } else if (type === 'payments') {
      data = await this.getPayments();
    } else {
      const stats = await this.getMonthStats();
      data = stats.daily;
    }

    return this.excelService.exportToExcel(data, type);
  }

  async getUserStats(userId: number): Promise<any> {
    const user = await this.userRepo.findOne({ 
      where: { id: userId } 
    });
    
    if (!user) {
      throw new Error('Foydalanuvchi topilmadi');
    }

    const [todayKpi, monthKpi, leads, cars] = await Promise.all([
      this.kpiService.getTodayStats(userId),
      this.kpiService.getMonthStats(userId),
      this.leadRepo.count({ where: { operatorId: userId } }),
      this.carRepo.count({ where: { createdById: userId } })
    ]);

    return {
      user: {
        id: user.id,
        name: user.firstName || user.username,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
      },
      stats: {
        today: todayKpi,
        month: monthKpi,
        totalLeads: leads,
        totalCars: cars
      }
    };
  }
}
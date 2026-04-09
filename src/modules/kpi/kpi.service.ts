import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThan } from 'typeorm';
import { Kpi } from '../../database/entities/kpi.entity';
import { User } from '../../database/entities/user.entity';
import { DailyStat } from '../../database/entities/daily-stat.entity';
import { KPI } from '../../common/constants/kpi.constants';
import { DateUtil } from '../../common/utils/date.util';

@Injectable()
export class KpiService {
  constructor(
    @InjectRepository(Kpi) private kpiRepo: Repository<Kpi>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(DailyStat) private dailyStatRepo: Repository<DailyStat>,
  ) {}

  // ============== MAVJUD METODLAR ==============
  async addRegistrarKpi(userId: number, carId: number): Promise<Kpi> {
    const kpi = new Kpi();
    kpi.userId = userId;
    kpi.actionType = KPI.actions.addCar;
    kpi.points = 1;
    kpi.amount = KPI.registrar.perCar;
    kpi.referenceId = carId;
    kpi.referenceType = 'car';
    
    const savedKpi = await this.kpiRepo.save(kpi);
    await this.updateDailyStat(userId, 'car', KPI.registrar.perCar);
    return savedKpi;
  }

  async addOperatorKpi(userId: number, leadId: number, amount: number): Promise<Kpi> {
    const kpi = new Kpi();
    kpi.userId = userId;
    kpi.actionType = KPI.actions.closeLead;
    kpi.points = 1;
    kpi.amount = amount;
    kpi.referenceId = leadId;
    kpi.referenceType = 'lead';
    
    const savedKpi = await this.kpiRepo.save(kpi);
    await this.updateDailyStat(userId, 'lead', amount);
    return savedKpi;
  }

  private async updateDailyStat(userId: number, type: string, amount: number): Promise<void> {
    const today = DateUtil.getToday();
    
    let dailyStat = await this.dailyStatRepo.findOne({
      where: {
        userId: userId,
        date: today
      }
    });
    
    if (!dailyStat) {
      dailyStat = new DailyStat();
      dailyStat.userId = userId;
      dailyStat.date = today;
      dailyStat.carsAdded = 0;
      dailyStat.leadsClosed = 0;
      dailyStat.totalEarned = 0;
    }
    
    if (type === 'car') {
      dailyStat.carsAdded += 1;
    } else {
      dailyStat.leadsClosed += 1;
    }
    
    dailyStat.totalEarned = Number(dailyStat.totalEarned) + amount;
    await this.dailyStatRepo.save(dailyStat);
  }

  async getTodayStats(userId: number): Promise<{ count: number; total: number }> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const kpis = await this.kpiRepo.find({
      where: {
        userId: userId,
        createdAt: Between(today, tomorrow)
      }
    });

    return {
      count: kpis.length,
      total: kpis.reduce((sum, k) => sum + Number(k.amount), 0)
    };
  }

  async getMonthStats(userId: number): Promise<{ count: number; total: number }> {
    const monthStart = DateUtil.getMonthStart();

    const kpis = await this.kpiRepo.find({
      where: {
        userId: userId,
        createdAt: MoreThanOrEqual(monthStart)
      }
    });

    return {
      count: kpis.length,
      total: kpis.reduce((sum, k) => sum + Number(k.amount), 0)
    };
  }

  async getUserRating(): Promise<any[]> {
    const users = await this.userRepo.find({
      where: { isActive: true },
      relations: ['kpis']
    });

    const monthStart = DateUtil.getMonthStart();

    return users.map(user => {
      const monthKpis = user.kpis?.filter(k => 
        new Date(k.createdAt) >= monthStart
      ) || [];

      const carsAdded = monthKpis.filter(k => k.actionType === KPI.actions.addCar).length;
      const leadsClosed = monthKpis.filter(k => k.actionType === KPI.actions.closeLead).length;
      const totalEarned = monthKpis.reduce((sum, k) => sum + Number(k.amount), 0);

      return {
        userId: user.id,
        name: user.firstName || user.username || 'No name',
        role: user.role,
        carsAdded,
        leadsClosed,
        totalEarned,
        rank: 0
      };
    }).sort((a, b) => b.totalEarned - a.totalEarned)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }

  // ============== 1. BUGUNGI JAMI KPI ==============
  async getTodayTotal(): Promise<number> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const kpis = await this.kpiRepo.find({
      where: {
        createdAt: Between(today, tomorrow)
      }
    });

    return kpis.reduce((sum, k) => sum + Number(k.amount), 0);
  }

  // ============== 2. OYLIK JAMI KPI ==============
  async getMonthTotal(): Promise<number> {
    const monthStart = DateUtil.getMonthStart();

    const kpis = await this.kpiRepo.find({
      where: {
        createdAt: MoreThanOrEqual(monthStart)
      }
    });

    return kpis.reduce((sum, k) => sum + Number(k.amount), 0);
  }

  // ============== 3. KUTILAYOTGAN TO'LOVLAR ==============
  async getPendingPayments(): Promise<any[]> {
    const operators = await this.userRepo.find({
      where: { 
        role: 'operator', 
        isActive: true 
      },
      relations: ['kpis']
    });

    const monthStart = DateUtil.getMonthStart();
    const monthEnd = DateUtil.getMonthEnd();

    const payments = operators.map(operator => {
      const monthKpis = operator.kpis?.filter(k => 
        new Date(k.createdAt) >= monthStart && new Date(k.createdAt) <= monthEnd
      ) || [];

      const totalAmount = monthKpis.reduce((sum, k) => sum + Number(k.amount), 0);

      return {
        userId: operator.id,
        name: operator.firstName || operator.username || 'No name',
        phone: operator.phone,
        amount: totalAmount,
        leads: monthKpis.length,
        period: {
          start: monthStart,
          end: monthEnd
        },
        status: totalAmount > 0 ? 'pending' : 'no_payments'
      };
    }).filter(p => p.amount > 0);

    return payments;
  }

  // ============== 4. YILLIK KPI STATISTIKASI ==============
  async getYearStats(): Promise<any> {
    const year = new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const kpis = await this.kpiRepo.find({
      where: {
        createdAt: Between(yearStart, yearEnd)
      },
      relations: ['user']
    });

    // Agar ma'lumot bo'lmasa
    if (kpis.length === 0) {
      return {
        year,
        total: 0,
        amount: 0,
        monthly: [],
        byType: { registrar: 0, operator: 0 },
        message: `${year} yil uchun KPI maʼlumotlari mavjud emas`
      };
    }

    const monthly = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0, 23, 59, 59);
      
      const monthKpis = kpis.filter(k => 
        new Date(k.createdAt) >= monthStart && new Date(k.createdAt) <= monthEnd
      );

      monthly.push({
        month: i + 1,
        monthName: new Date(year, i, 1).toLocaleString('uz-UZ', { month: 'long' }),
        count: monthKpis.length,
        amount: monthKpis.reduce((sum, k) => sum + Number(k.amount), 0)
      });
    }

    return {
      year,
      total: kpis.length,
      amount: kpis.reduce((sum, k) => sum + Number(k.amount), 0),
      monthly,
      byType: {
        registrar: kpis.filter(k => k.actionType === KPI.actions.addCar).length,
        operator: kpis.filter(k => k.actionType === KPI.actions.closeLead).length
      },
      message: null
    };
  }

  // ============== 5. OPERATORLAR BO'YICHA KPI TAQSIMOTI ==============
  async getOperatorKpiDistribution(): Promise<any[]> {
    const operators = await this.userRepo.find({
      where: { 
        role: 'operator', 
        isActive: true 
      },
      relations: ['kpis']
    });

    const monthStart = DateUtil.getMonthStart();

    return operators.map(operator => {
      const monthKpis = operator.kpis?.filter(k => 
        new Date(k.createdAt) >= monthStart
      ) || [];

      const hotKpi = monthKpis.filter(k => k.amount === 7000).length;
      const warmKpi = monthKpis.filter(k => k.amount === 5000).length;
      const coldKpi = monthKpis.filter(k => k.amount === 3000).length;

      return {
        id: operator.id,
        name: operator.firstName || operator.username,
        hot: hotKpi,
        warm: warmKpi,
        cold: coldKpi,
        total: monthKpis.length,
        amount: monthKpis.reduce((sum, k) => sum + Number(k.amount), 0)
      };
    });
  }

  // ============== 6. KPI BO'YICHA UMUMIY STATISTIKA ==============
  async getGlobalKpiStats(): Promise<any> {
    const today = DateUtil.getToday();
    const monthStart = DateUtil.getMonthStart();
    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    const [todayTotal, monthTotal, yearTotal, total] = await Promise.all([
      this.getTodayTotal(),
      this.getMonthTotal(),
      this.getYearStats().then(s => s.amount),
      this.kpiRepo.find().then(k => k.reduce((sum, k) => sum + Number(k.amount), 0))
    ]);

    return {
      today: todayTotal,
      month: monthTotal,
      year: yearTotal,
      total
    };
  }

  // ============== 7. ESKI KPI LARNI TOZALASH ==============
  async cleanOldKpis(days: number = 90): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await this.kpiRepo.delete({
      createdAt: LessThan(date)
    });

    return result.affected || 0;
  }

  // ============== 8. KUNLIK KPI HISOBOTI ==============
  async getDailyKpiReport(date?: Date): Promise<any> {
    const reportDate = date || DateUtil.getToday();
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const kpis = await this.kpiRepo.find({
      where: {
        createdAt: Between(reportDate, nextDay)
      },
      relations: ['user']
    });

    const byUser = {};
    for (const kpi of kpis) {
      const userId = kpi.userId;
      if (!byUser[userId]) {
        byUser[userId] = {
          name: kpi.user?.firstName || kpi.user?.username || 'Unknown',
          count: 0,
          amount: 0
        };
      }
      byUser[userId].count++;
      byUser[userId].amount += Number(kpi.amount);
    }

    return {
      date: reportDate,
      total: kpis.length,
      amount: kpis.reduce((sum, k) => sum + Number(k.amount), 0),
      byUser: Object.values(byUser)
    };
  }

  // ============== 9. KPI STATISTIKASI ==============
  async getKpiStats(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case 'day':
        startDate = DateUtil.getToday();
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = DateUtil.getMonthStart();
        break;
      case 'year':
        startDate = new Date(new Date().getFullYear(), 0, 1);
        break;
      default:
        startDate = DateUtil.getMonthStart();
    }

    const kpis = await this.kpiRepo.find({
      where: {
        createdAt: Between(startDate, endDate)
      },
      relations: ['user']
    });

    // Agar ma'lumot bo'lmasa
    if (kpis.length === 0) {
      return {
        period,
        startDate,
        endDate,
        total: 0,
        amount: 0,
        message: this.getPeriodMessage(period),
        byType: { registrar: 0, operator: 0 },
        byUser: []
      };
    }

    const byUser = {};
    for (const kpi of kpis) {
      const userId = kpi.userId;
      if (!byUser[userId]) {
        byUser[userId] = {
          name: kpi.user?.firstName || kpi.user?.username || 'Unknown',
          count: 0,
          amount: 0
        };
      }
      byUser[userId].count++;
      byUser[userId].amount += Number(kpi.amount);
    }

    return {
      period,
      startDate,
      endDate,
      total: kpis.length,
      amount: kpis.reduce((sum, k) => sum + Number(k.amount), 0),
      byUser: Object.values(byUser),
      byType: {
        registrar: kpis.filter(k => k.actionType === KPI.actions.addCar).length,
        operator: kpis.filter(k => k.actionType === KPI.actions.closeLead).length
      },
      message: null
    };
  }

  // ============== 🔥 YANGI METODLAR (bot.update.ts UCHUN) ==============

  /**
   * 🔥 YANGI: Foydalanuvchi statistikasi (qator 706 uchun)
   */
  async getUserStats(userId: number): Promise<any> {
    const [today, month, total] = await Promise.all([
      this.getTodayStats(userId),
      this.getMonthStats(userId),
      this.kpiRepo.find({ where: { userId } })
    ]);

    return {
      carsCount: total.filter(k => k.actionType === KPI.actions.addCar).length,
      totalEarned: total.reduce((sum, k) => sum + Number(k.amount), 0),
      today: today.count,
      month: month.count
    };
  }

  /**
   * 🔥 YANGI: Oylik KPI hisoblash (qator 1196 uchun)
   */
  async calculateMonthlyKpi(): Promise<any> {
    const monthStart = DateUtil.getMonthStart();
    const monthEnd = DateUtil.getMonthEnd();

    const kpis = await this.kpiRepo.find({
      where: {
        createdAt: Between(monthStart, monthEnd)
      },
      relations: ['user']
    });

    const total = kpis.reduce((sum, k) => sum + Number(k.amount), 0);
    const employees = new Set(kpis.map(k => k.userId)).size;

    // Eng yaxshi xodimni topish
    const userStats = {};
    for (const kpi of kpis) {
      if (!userStats[kpi.userId]) {
        userStats[kpi.userId] = {
          name: kpi.user?.firstName || kpi.user?.username || 'Noma\'lum',
          amount: 0
        };
      }
      userStats[kpi.userId].amount += Number(kpi.amount);
    }

    let topEmployee = 'Mavjud emas';
    let topAmount = 0;
    for (const userId in userStats) {
      if (userStats[userId].amount > topAmount) {
        topAmount = userStats[userId].amount;
        topEmployee = userStats[userId].name;
      }
    }

    return {
      total,
      employees,
      topEmployee,
      month: monthStart.toLocaleDateString('uz-UZ', { month: 'long' })
    };
  }

  /**
   * 🔥 YANGI: KPI sozlamalari (qator 1412 uchun)
   */
  async getSettings(): Promise<any> {
    // Bu ma'lumotlar odatda database'dan olinadi
    // Hozircha hardcoded qaytaramiz
    return {
      registrarRate: 2500,
      hotRate: 7000,
      warmRate: 5000,
      coldRate: 3000
    };
  }

  /**
   * 🔥 YANGI: Bildirishnoma sozlamalari (qator 1433 uchun)
   */
  async getNotificationSettings(): Promise<any> {
    // Bu ma'lumotlar odatda database'dan olinadi
    // Hozircha hardcoded qaytaramiz
    return {
      enabled: true,
      notifyDays: [10, 5, 1]
    };
  }

  /**
   * 🔥 YANGI: Backup yaratish (qator 1471 uchun)
   */
  async createBackup(): Promise<string> {
    // Bu metod odatda ma'lumotlarni backup qiladi
    // Hozircha placeholder
    const backupPath = `/tmp/backup_${Date.now()}.json`;
    
    // Ma'lumotlarni olish
    const [kpis, users] = await Promise.all([
      this.kpiRepo.find(),
      this.userRepo.find()
    ]);

    // Faylga yozish
    const fs = require('fs');
    const data = {
      timestamp: new Date(),
      kpis: kpis.length,
      users: users.length,
      data: { kpis, users }
    };
    
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    
    return backupPath;
  }

  /**
   * 🔥 YANGI: Lead amount hisoblash (qator 1604 uchun)
   */
  calculateLeadAmount(leadType: string): number {
    const amounts = {
      'HOT': 7000,
      'WARM': 5000,
      'COLD': 3000
    };
    return amounts[leadType] || 5000;
  }

  // ============== 10. PERIODGA MOS XABAR ==============
  private getPeriodMessage(period: string): string {
    const messages: Record<string, string> = {
      day: 'Bugungi kun uchun KPI maʼlumotlari mavjud emas',
      week: 'Oxirgi 7 kun uchun KPI maʼlumotlari mavjud emas',
      month: 'Bu oy uchun KPI maʼlumotlari mavjud emas',
      year: `${new Date().getFullYear()} yil uchun KPI maʼlumotlari mavjud emas`
    };
    return messages[period] || 'Maʼlumotlar mavjud emas';
  }
}
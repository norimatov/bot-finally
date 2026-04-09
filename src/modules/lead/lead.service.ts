import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, IsNull, Not } from 'typeorm';
import { Lead } from '../../database/entities/lead.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { User } from '../../database/entities/user.entity';
import { Car } from '../../database/entities/car.entity';
import { KpiService } from '../kpi/kpi.service';
import { DateUtil } from '../../common/utils/date.util';
import { KPI } from '../../common/constants/kpi.constants';
import { BotService } from '../bot/bot.service';

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);

  constructor(
    @InjectRepository(Lead) private leadRepo: Repository<Lead>,
    @InjectRepository(CarInsurance) private insuranceRepo: Repository<CarInsurance>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Car) private carRepo: Repository<Car>,
    private kpiService: KpiService,
    private botService: BotService,
  ) {}

  // ============== LEAD YARATISH ==============
  async createLead(data: {
    carId: number;
    insuranceId: number;
    operatorId?: number;
    leadType: 'HOT' | 'WARM' | 'COLD';
    daysRemaining: number;
  }): Promise<Lead> {
    const lead = new Lead();
    lead.carId = data.carId;
    lead.insuranceId = data.insuranceId;
    lead.operatorId = data.operatorId;
    lead.leadType = data.leadType;
    lead.daysRemaining = data.daysRemaining;
    lead.status = 'new';
    lead.callCount = 0;
    lead.followUpCount = 0;
    lead.reminded = false;

    const savedLead = await this.leadRepo.save(lead);
    this.logger.log(`✅ Yangi lead yaratildi: #${savedLead.id} - ${data.leadType}`);
    
    return savedLead;
  }

  // ============== BIR NECHTA LEAD YARATISH ==============
  async createLeadsForInsurance(insurance: CarInsurance): Promise<Lead[]> {
    const daysLeft = DateUtil.daysRemaining(insurance.endDate);
    let leadType: 'HOT' | 'WARM' | 'COLD';
    
    if (daysLeft <= 10) leadType = 'HOT';
    else if (daysLeft <= 30) leadType = 'WARM';
    else leadType = 'COLD';

    const operators = await this.userRepo.find({
      where: { 
        role: 'operator', 
        isActive: true 
      }
    });

    const leads: Lead[] = [];

    for (const operator of operators) {
      const existingLead = await this.leadRepo.findOne({
        where: {
          insuranceId: insurance.id,
          operatorId: operator.id,
          status: 'new'
        }
      });

      if (!existingLead) {
        const lead = await this.createLead({
          carId: insurance.carId,
          insuranceId: insurance.id,
          operatorId: operator.id,
          leadType,
          daysRemaining: daysLeft
        });
        leads.push(lead);
      }
    }

    return leads;
  }

  // ============== HOT LEADLAR ==============
  async getHotLeads(operatorId: number): Promise<Lead[]> {
    return this.leadRepo.find({
      where: {
        operatorId,
        leadType: 'HOT',
        status: 'new'
      },
      relations: ['car', 'insurance'],
      order: { 
        daysRemaining: 'ASC',
        createdAt: 'ASC' 
      }
    });
  }

  // ============== HOT LEADLAR SONI ==============
  async getHotLeadsCount(operatorId: number): Promise<number> {
    return this.leadRepo.count({
      where: {
        operatorId,
        leadType: 'HOT',
        status: 'new'
      }
    });
  }

  // ============== WARM LEADLAR ==============
  async getWarmLeads(operatorId: number): Promise<Lead[]> {
    return this.leadRepo.find({
      where: {
        operatorId,
        leadType: 'WARM',
        status: 'new'
      },
      relations: ['car', 'insurance'],
      order: { 
        daysRemaining: 'ASC',
        createdAt: 'ASC' 
      }
    });
  }

  // ============== WARM LEADLAR SONI ==============
  async getWarmLeadsCount(operatorId: number): Promise<number> {
    return this.leadRepo.count({
      where: {
        operatorId,
        leadType: 'WARM',
        status: 'new'
      }
    });
  }

  // ============== COLD LEADLAR ==============
  async getColdLeads(operatorId: number): Promise<Lead[]> {
    return this.leadRepo.find({
      where: {
        operatorId,
        leadType: 'COLD',
        status: 'new'
      },
      relations: ['car', 'insurance'],
      order: { 
        daysRemaining: 'ASC',
        createdAt: 'ASC' 
      }
    });
  }

  // ============== COLD LEADLAR SONI ==============
  async getColdLeadsCount(operatorId: number): Promise<number> {
    return this.leadRepo.count({
      where: {
        operatorId,
        leadType: 'COLD',
        status: 'new'
      }
    });
  }

  // ============== OPERATORNING BARCHA LEADLARI ==============
  async getOperatorLeads(operatorId: number): Promise<Lead[]> {
    return this.leadRepo.find({
      where: { operatorId },
      relations: ['car', 'insurance'],
      order: { createdAt: 'DESC' }
    });
  }

  // ============== LEAD STATUSINI YANGILASH ==============
  async updateLeadStatus(
    leadId: number, 
    status: string, 
    operatorId: number,
    notes?: string
  ): Promise<Lead> {
    const lead = await this.leadRepo.findOne({
      where: { id: leadId },
      relations: ['insurance', 'car', 'operator']
    });

    if (!lead) {
      throw new Error('Lead topilmadi');
    }

    const oldStatus = lead.status;
    
    lead.status = status;
    lead.updatedAt = new Date();
    
    if (notes) {
      lead.notes = notes;
    }

    if (status === 'closed') {
      lead.closedAt = new Date();
      
      let amount = 5000;
      if (lead.leadType === 'HOT') amount = 7000;
      else if (lead.leadType === 'WARM') amount = 5000;
      else if (lead.leadType === 'COLD') amount = 3000;

      await this.kpiService.addOperatorKpi(operatorId, leadId, amount);
      
      if (lead.insurance) {
        lead.insurance.status = 'renewed';
        await this.insuranceRepo.save(lead.insurance);
        this.logger.log(`✅ Sug'urta yangilandi: #${lead.insurance.id}`);
      }

      const operator = await this.userRepo.findOne({ where: { id: operatorId } });
      if (operator) {
        await this.botService.notifyAboutClosedLead(lead, operator, amount);
      }
    }

    const updatedLead = await this.leadRepo.save(lead);
    this.logger.log(`📊 Lead status o'zgartirildi: #${leadId} ${oldStatus} -> ${status}`);
    
    return updatedLead;
  }

  // ============== BIR NECHTA LEAD STATUSINI YANGILASH ==============
  async bulkUpdateStatus(
    leadIds: number[],
    status: string,
    operatorId: number
  ): Promise<number> {
    let updated = 0;
    
    for (const leadId of leadIds) {
      try {
        await this.updateLeadStatus(leadId, status, operatorId);
        updated++;
      } catch (error) {
        this.logger.error(`Lead #${leadId} yangilashda xatolik: ${error.message}`);
      }
    }
    
    return updated;
  }

  // ============== LEAD NI OPERATORGA BIRIKTIRISH ==============
  async assignLead(leadId: number, operatorId: number): Promise<Lead> {
    const lead = await this.leadRepo.findOne({
      where: { id: leadId }
    });

    if (!lead) {
      throw new Error('Lead topilmadi');
    }

    lead.operatorId = operatorId;
    lead.status = 'inProgress';
    
    const updatedLead = await this.leadRepo.save(lead);
    this.logger.log(`👤 Lead #${leadId} operator #${operatorId} ga biriktirildi`);
    
    return updatedLead;
  }

  // ============== MUDDATI TUGAGAN LEADLAR ==============
  async getExpiredLeads(): Promise<Lead[]> {
    const today = new Date();
    
    return this.leadRepo.find({
      where: {
        insurance: {
          endDate: LessThan(today)
        },
        status: 'new'
      },
      relations: ['insurance', 'car']
    });
  }

  // ============== MUDDATI YAQINLASHGAN LEADLAR ==============
  async getExpiringLeads(days: number): Promise<Lead[]> {
    const targetDate = DateUtil.getDateRange(days);
    
    return this.leadRepo.find({
      where: {
        insurance: {
          endDate: LessThan(targetDate)
        },
        status: 'new'
      },
      relations: ['insurance', 'car']
    });
  }

  // ============== OPERATOR STATISTIKASI ==============
  async getOperatorStats(operatorId: number): Promise<any> {
    const leads = await this.leadRepo.find({
      where: { operatorId }
    });

    const today = DateUtil.getToday();
    const monthStart = DateUtil.getMonthStart();

    const todayLeads = leads.filter(l => 
      new Date(l.createdAt) >= today
    );

    const monthLeads = leads.filter(l => 
      new Date(l.createdAt) >= monthStart
    );

    const closedLeads = leads.filter(l => l.status === 'closed').length;
    const totalLeads = leads.length;

    return {
      total: {
        all: totalLeads,
        hot: leads.filter(l => l.leadType === 'HOT').length,
        warm: leads.filter(l => l.leadType === 'WARM').length,
        cold: leads.filter(l => l.leadType === 'COLD').length,
        closed: closedLeads
      },
      today: {
        all: todayLeads.length,
        closed: todayLeads.filter(l => l.status === 'closed').length,
        postponed: todayLeads.filter(l => l.status === 'postponed').length,
        rejected: todayLeads.filter(l => l.status === 'rejected').length
      },
      month: {
        all: monthLeads.length,
        closed: monthLeads.filter(l => l.status === 'closed').length,
        postponed: monthLeads.filter(l => l.status === 'postponed').length,
        rejected: monthLeads.filter(l => l.status === 'rejected').length
      },
      performance: {
        conversionRate: totalLeads > 0 
          ? Number(((closedLeads / totalLeads) * 100).toFixed(1))
          : 0,
        avgResponseTime: await this.calculateAvgResponseTime(operatorId),
        hotConversion: await this.calculateHotConversion(operatorId)
      },
      calls: {
        total: leads.reduce((sum, l) => sum + (l.callCount || 0), 0),
        avgPerLead: leads.length > 0 
          ? Math.round(leads.reduce((sum, l) => sum + (l.callCount || 0), 0) / leads.length)
          : 0
      }
    };
  }

  // ============== O'RTACHA JAVOB BERISH VAQTI ==============
  private async calculateAvgResponseTime(operatorId: number): Promise<number> {
    const leads = await this.leadRepo.find({
      where: {
        operatorId,
        status: 'closed'
      }
    });

    if (leads.length === 0) return 0;

    let totalTime = 0;
    let count = 0;

    for (const lead of leads) {
      if (lead.closedAt) {
        const created = new Date(lead.createdAt).getTime();
        const closed = new Date(lead.closedAt).getTime();
        totalTime += (closed - created) / (1000 * 60);
        count++;
      }
    }

    return count > 0 ? Math.round(totalTime / count) : 0;
  }

  // ============== HOT LEAD KONVERSIYASI ==============
  private async calculateHotConversion(operatorId: number): Promise<number> {
    const hotLeads = await this.leadRepo.find({
      where: {
        operatorId,
        leadType: 'HOT'
      }
    });

    if (hotLeads.length === 0) return 0;

    const closedHotLeads = hotLeads.filter(l => l.status === 'closed').length;
    return Number(((closedHotLeads / hotLeads.length) * 100).toFixed(1));
  }

  // ============== BARCHA OPERATORLAR REYTINGI ==============
  async getOperatorsRating(): Promise<any[]> {
    const operators = await this.userRepo.find({
      where: { 
        role: 'operator', 
        isActive: true 
      },
      relations: ['leads']
    });

    const monthStart = DateUtil.getMonthStart();

    const rating = operators.map(operator => {
      const monthLeads = operator.leads?.filter(l => 
        new Date(l.createdAt) >= monthStart
      ) || [];

      const closedLeads = monthLeads.filter(l => l.status === 'closed');
      const hotClosed = closedLeads.filter(l => l.leadType === 'HOT').length;
      const warmClosed = closedLeads.filter(l => l.leadType === 'WARM').length;
      const coldClosed = closedLeads.filter(l => l.leadType === 'COLD').length;

      const totalAmount = 
        hotClosed * 7000 +
        warmClosed * 5000 +
        coldClosed * 3000;

      return {
        id: operator.id,
        name: operator.firstName || operator.username || 'No name',
        username: operator.username,
        phone: operator.phone,
        totalLeads: monthLeads.length,
        closedLeads: closedLeads.length,
        hotClosed,
        warmClosed,
        coldClosed,
        conversionRate: monthLeads.length > 0 
          ? Number(((closedLeads.length / monthLeads.length) * 100).toFixed(1))
          : 0,
        totalEarned: totalAmount,
        avgPerLead: closedLeads.length > 0 
          ? Math.round(totalAmount / closedLeads.length)
          : 0,
        totalCalls: monthLeads.reduce((sum, l) => sum + (l.callCount || 0), 0)
      };
    });

    return rating.sort((a, b) => b.totalEarned - a.totalEarned);
  }

  // ============== LEAD QIDIRISH ==============
  async searchLeads(query: string): Promise<Lead[]> {
    return this.leadRepo
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.car', 'car')
      .leftJoinAndSelect('lead.insurance', 'insurance')
      .leftJoinAndSelect('lead.operator', 'operator')
      .where('car.plateNumber ILIKE :query', { query: `%${query}%` })
      .orWhere('car.ownerPhone ILIKE :query', { query: `%${query}%` })
      .orWhere('operator.username ILIKE :query', { query: `%${query}%` })
      .orWhere('lead.notes ILIKE :query', { query: `%${query}%` })
      .orWhere('lead.customerComment ILIKE :query', { query: `%${query}%` })
      .orderBy('lead.createdAt', 'DESC')
      .getMany();
  }

  // ============== LEAD NI O'CHIRISH (SOFT DELETE) ==============
  async softDeleteLead(leadId: number): Promise<void> {
    await this.leadRepo.update(leadId, {
      status: 'rejected',
      notes: 'Lead o\'chirildi',
      updatedAt: new Date()
    });
    
    this.logger.log(`🗑️ Lead #${leadId} o'chirildi`);
  }

  // ============== KUNLIK HISOBOT ==============
  async getDailyReport(date?: Date): Promise<any> {
    const reportDate = date || DateUtil.getToday();
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const leads = await this.leadRepo.find({
      where: {
        createdAt: Between(reportDate, nextDay)
      },
      relations: ['operator', 'car']
    });

    const byOperator: Record<string, { name: string; total: number; closed: number; calls: number }> = {};
    
    for (const lead of leads) {
      if (lead.operator) {
        const key = `op_${lead.operator.id}`;
        if (!byOperator[key]) {
          byOperator[key] = {
            name: lead.operator.firstName || lead.operator.username || 'Unknown',
            total: 0,
            closed: 0,
            calls: 0
          };
        }
        byOperator[key].total++;
        byOperator[key].calls += lead.callCount || 0;
        if (lead.status === 'closed') {
          byOperator[key].closed++;
        }
      }
    }

    return {
      date: reportDate,
      totalLeads: leads.length,
      totalCalls: leads.reduce((sum, l) => sum + (l.callCount || 0), 0),
      byType: {
        hot: leads.filter(l => l.leadType === 'HOT').length,
        warm: leads.filter(l => l.leadType === 'WARM').length,
        cold: leads.filter(l => l.leadType === 'COLD').length
      },
      byStatus: {
        new: leads.filter(l => l.status === 'new').length,
        closed: leads.filter(l => l.status === 'closed').length,
        postponed: leads.filter(l => l.status === 'postponed').length,
        rejected: leads.filter(l => l.status === 'rejected').length
      },
      byOperator: Object.values(byOperator)
    };
  }

  // ============== LEAD NI QAYTA ISHLASH ==============
  async reopenLead(leadId: number): Promise<Lead> {
    const lead = await this.leadRepo.findOne({
      where: { id: leadId }
    });

    if (!lead) {
      throw new Error('Lead topilmadi');
    }

    lead.status = 'new';
    lead.closedAt = null;
    lead.updatedAt = new Date();

    return this.leadRepo.save(lead);
  }

  // ============== LEADLARNI TOZALASH (ESKILARINI) ==============
  async cleanOldLeads(days: number = 30): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await this.leadRepo
      .createQueryBuilder()
      .update()
      .set({ 
        status: 'rejected',
        notes: 'Muddat o\'tgan lead',
        updatedAt: new Date()
      })
      .where('status = :status', { status: 'new' })
      .andWhere('createdAt < :date', { date })
      .execute();

    this.logger.log(`🧹 ${result.affected || 0} ta eski lead tozalandi`);
    
    return result.affected || 0;
  }

  // ============== LEAD STATISTIKASINI TOZALASH ==============
  async clearLeadStats(operatorId: number): Promise<void> {
    await this.leadRepo.update(
      { operatorId, status: 'closed' },
      { status: 'rejected', notes: 'Statistika tozalandi', updatedAt: new Date() }
    );
    this.logger.log(`🧹 Operator #${operatorId} statistikasi tozalandi`);
  }

  // ============== LEAD MA'LUMOTLARINI EKSPORT QILISH ==============
  async exportLeads(operatorId?: number): Promise<Lead[]> {
    const where = operatorId ? { operatorId } : {};
    return this.leadRepo.find({
      where,
      relations: ['car', 'insurance', 'operator'],
      order: { createdAt: 'DESC' }
    });
  }

  // ============== BUGUNGI LEADLAR SONI ==============
  async getTodayCount(): Promise<number> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.leadRepo.count({
      where: {
        createdAt: Between(today, tomorrow)
      }
    });
  }

  // ============== OYLIK LEADLAR SONI ==============
  async getMonthCount(): Promise<number> {
    const monthStart = DateUtil.getMonthStart();
    const monthEnd = DateUtil.getMonthEnd();

    return this.leadRepo.count({
      where: {
        createdAt: Between(monthStart, monthEnd)
      }
    });
  }

  // ============== ENG YAXSHI OPERATOR ==============
  async getTopOperator(): Promise<any> {
    const operators = await this.userRepo.find({
      where: { 
        role: 'operator', 
        isActive: true 
      },
      relations: ['leads']
    });

    const monthStart = DateUtil.getMonthStart();

    let topOperator = {
      id: 0,
      name: 'Mavjud emas',
      leads: 0,
      amount: 0,
      calls: 0
    };

    for (const operator of operators) {
      const monthLeads = operator.leads?.filter(l => 
        new Date(l.createdAt) >= monthStart && l.status === 'closed'
      ) || [];

      const totalAmount = monthLeads.reduce((sum, l) => {
        if (l.leadType === 'HOT') return sum + 7000;
        if (l.leadType === 'WARM') return sum + 5000;
        return sum + 3000;
      }, 0);

      const totalCalls = monthLeads.reduce((sum, l) => sum + (l.callCount || 0), 0);

      if (totalAmount > topOperator.amount) {
        topOperator = {
          id: operator.id,
          name: operator.firstName || operator.username || 'Nomaʼlum',
          leads: monthLeads.length,
          amount: totalAmount,
          calls: totalCalls
        };
      }
    }

    return topOperator;
  }

  // ============== LEAD STATISTIKASI ==============
  async getLeadAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
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

    const leads = await this.leadRepo.find({
      where: {
        createdAt: Between(startDate, endDate)
      },
      relations: ['operator']
    });

    if (leads.length === 0) {
      return {
        period,
        startDate,
        endDate,
        total: 0,
        message: this.getPeriodMessage(period),
        byType: { hot: 0, warm: 0, cold: 0 },
        byStatus: { new: 0, closed: 0, postponed: 0, rejected: 0 },
        conversion: 0,
        calls: 0
      };
    }

    const dailyData: Record<string, { total: number; hot: number; warm: number; cold: number; closed: number; calls: number }> = {};
    const operatorData: Record<string, number> = {};

    leads.forEach(lead => {
      const date = lead.createdAt.toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = { total: 0, hot: 0, warm: 0, cold: 0, closed: 0, calls: 0 };
      }
      
      dailyData[date].total++;
      dailyData[date][lead.leadType.toLowerCase() as 'hot' | 'warm' | 'cold']++;
      dailyData[date].calls += lead.callCount || 0;
      
      if (lead.status === 'closed') {
        dailyData[date].closed++;
      }

      if (lead.operator) {
        const opName = lead.operator.firstName || lead.operator.username || 'Unknown';
        operatorData[opName] = (operatorData[opName] || 0) + 1;
      }
    });

    const closedCount = leads.filter(l => l.status === 'closed').length;
    const totalCount = leads.length;
    const totalCalls = leads.reduce((sum, l) => sum + (l.callCount || 0), 0);

    let monthlyData = null;
    if (period === 'year') {
      monthlyData = await this.getMonthlyLeadStats();
    }

    return {
      period,
      startDate,
      endDate,
      total: totalCount,
      totalCalls,
      avgCallsPerLead: totalCount > 0 ? Math.round(totalCalls / totalCount) : 0,
      byType: {
        hot: leads.filter(l => l.leadType === 'HOT').length,
        warm: leads.filter(l => l.leadType === 'WARM').length,
        cold: leads.filter(l => l.leadType === 'COLD').length
      },
      byStatus: {
        new: leads.filter(l => l.status === 'new').length,
        closed: closedCount,
        postponed: leads.filter(l => l.status === 'postponed').length,
        rejected: leads.filter(l => l.status === 'rejected').length
      },
      daily: dailyData,
      operators: operatorData,
      monthly: monthlyData,
      conversion: totalCount > 0 
        ? Number(((closedCount / totalCount) * 100).toFixed(1))
        : 0,
      message: null
    };
  }

  // ============== OYLIK LEAD STATISTIKASI (YILLIK UCHUN) ==============
  private async getMonthlyLeadStats(): Promise<any[]> {
    const year = new Date().getFullYear();
    const monthlyStats = [];

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0, 23, 59, 59);

      const count = await this.leadRepo.count({
        where: {
          createdAt: Between(monthStart, monthEnd)
        }
      });

      const closedCount = await this.leadRepo.count({
        where: {
          createdAt: Between(monthStart, monthEnd),
          status: 'closed'
        }
      });

      monthlyStats.push({
        month: i + 1,
        monthName: new Date(year, i, 1).toLocaleString('uz-UZ', { month: 'long' }),
        total: count,
        closed: closedCount
      });
    }

    return monthlyStats;
  }

  // ============== PERIODGA MOS XABAR ==============
  private getPeriodMessage(period: string): string {
    const messages: Record<string, string> = {
      day: 'Bugungi kun uchun lead maʼlumotlari mavjud emas',
      week: 'Oxirgi 7 kun uchun lead maʼlumotlari mavjud emas',
      month: 'Bu oy uchun lead maʼlumotlari mavjud emas',
      year: `${new Date().getFullYear()} yil uchun lead maʼlumotlari mavjud emas`
    };
    return messages[period] || 'Maʼlumotlar mavjud emas';
  }

  // ============== LEADLARNI OPERATORLARGA TAQSIMLASH ==============
  async assignLeadsToOperators(): Promise<number> {
    const unassignedLeads = await this.leadRepo.find({
      where: {
        operatorId: null,
        status: 'new'
      }
    });

    const operators = await this.userRepo.find({
      where: { 
        role: 'operator', 
        isActive: true 
      }
    });

    if (operators.length === 0 || unassignedLeads.length === 0) {
      return 0;
    }

    let assigned = 0;
    for (let i = 0; i < unassignedLeads.length; i++) {
      const operator = operators[i % operators.length];
      unassignedLeads[i].operatorId = operator.id;
      assigned++;
    }

    await this.leadRepo.save(unassignedLeads);
    this.logger.log(`📤 ${assigned} ta lead operatorlarga taqsimlandi`);
    
    return assigned;
  }

  // ============== LEADLAR BO'YICHA UMUMIY STATISTIKA ==============
  async getGlobalStats(): Promise<any> {
    const today = DateUtil.getToday();
    const monthStart = DateUtil.getMonthStart();
    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    const [todayCount, monthCount, yearCount, totalCount, byType, totalCalls] = await Promise.all([
      this.getTodayCount(),
      this.getMonthCount(),
      this.leadRepo.count({ where: { createdAt: Between(yearStart, new Date()) } }),
      this.leadRepo.count(),
      this.getLeadTypeStats(),
      this.leadRepo
        .createQueryBuilder('lead')
        .select('SUM(lead.callCount)', 'total')
        .getRawOne()
    ]);

    return {
      today: todayCount,
      month: monthCount,
      year: yearCount,
      total: totalCount,
      totalCalls: parseInt(totalCalls?.total) || 0,
      byType
    };
  }

  // ============== LEAD TURLARI BO'YICHA STATISTIKA ==============
  private async getLeadTypeStats(): Promise<any> {
    const hot = await this.leadRepo.count({ where: { leadType: 'HOT' } });
    const warm = await this.leadRepo.count({ where: { leadType: 'WARM' } });
    const cold = await this.leadRepo.count({ where: { leadType: 'COLD' } });

    return { hot, warm, cold };
  }

  // ============== STATUS BO'YICHA LEADLAR ==============
  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return this.leadRepo.find({
      where: { status },
      relations: ['car', 'insurance', 'operator'],
      order: { createdAt: 'DESC' }
    });
  }

  // ============== OPERATORNING ISH FAOLIYATI (BATAFSIL) ==============
  async getOperatorPerformance(operatorId: number, period: 'day' | 'week' | 'month' = 'month'): Promise<any> {
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
      default:
        startDate = DateUtil.getMonthStart();
    }

    const leads = await this.leadRepo.find({
      where: {
        operatorId,
        createdAt: Between(startDate, endDate)
      },
      relations: ['car']
    });

    const closed = leads.filter(l => l.status === 'closed');
    const revenue = closed.reduce((sum, l) => {
      if (l.leadType === 'HOT') return sum + 7000;
      if (l.leadType === 'WARM') return sum + 5000;
      return sum + 3000;
    }, 0);

    const totalCalls = leads.reduce((sum, l) => sum + (l.callCount || 0), 0);

    return {
      period,
      total: leads.length,
      totalCalls,
      avgCallsPerLead: leads.length > 0 ? Math.round(totalCalls / leads.length) : 0,
      byType: {
        hot: leads.filter(l => l.leadType === 'HOT').length,
        warm: leads.filter(l => l.leadType === 'WARM').length,
        cold: leads.filter(l => l.leadType === 'COLD').length
      },
      byStatus: {
        new: leads.filter(l => l.status === 'new').length,
        closed: closed.length,
        postponed: leads.filter(l => l.status === 'postponed').length,
        rejected: leads.filter(l => l.status === 'rejected').length
      },
      revenue,
      conversionRate: leads.length > 0 
        ? Number(((closed.length / leads.length) * 100).toFixed(1))
        : 0
    };
  }

  // ============== LEAD NI ID BO'YICHA TOPISH ==============
  async findById(leadId: number): Promise<Lead> {
    return this.leadRepo.findOne({
      where: { id: leadId },
      relations: ['car', 'insurance', 'operator']
    });
  }

  // ============== 🔥 YANGI METODLAR (OPERATOR FUNKSIYALARI) ==============

  /**
   * Operator qo'ng'iroqlar tarixi
   */
  async getOperatorCallHistory(operatorId: number, limit: number = 50): Promise<Lead[]> {
    return this.leadRepo.find({
      where: { 
        operatorId,
        callCount: MoreThan(0)
      },
      relations: ['car'],
      order: { lastCallAt: 'DESC' },
      take: limit
    });
  }

  /**
   * Bugungi leadlar
   */
  async getTodayLeads(operatorId: number): Promise<Lead[]> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.leadRepo.find({
      where: {
        operatorId,
        createdAt: Between(today, tomorrow)
      },
      relations: ['car'],
      order: { createdAt: 'ASC' }
    });
  }

  /**
   * Bugungi bajarilganlar
   */
  async getTodayCompleted(operatorId: number): Promise<Lead[]> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.leadRepo.find({
      where: {
        operatorId,
        status: 'closed',
        updatedAt: Between(today, tomorrow)
      },
      relations: ['car']
    });
  }

  /**
   * Bugungi keyinga qoldirilganlar
   */
  async getTodayPostponed(operatorId: number): Promise<Lead[]> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.leadRepo.find({
      where: {
        operatorId,
        status: 'postponed',
        updatedAt: Between(today, tomorrow)
      },
      relations: ['car']
    });
  }

  /**
   * Qo'ng'iroqni log'ga yozish
   */
  async logCall(leadId: number, operatorId: number, duration?: number, result?: string): Promise<Lead> {
    const lead = await this.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead topilmadi');
    }
    
    lead.lastCallAt = new Date();
    lead.callCount = (lead.callCount || 0) + 1;
    lead.followUpCount = (lead.followUpCount || 0) + 1;
    lead.lastFollowUp = new Date();
    
    if (duration) {
      lead.callDuration = duration;
    }
    
    if (result) {
      lead.callResult = result;
    }
    
    const updatedLead = await this.leadRepo.save(lead);
    this.logger.log(`📞 Qo'ng'iroq qilindi: Lead #${leadId}, Operator #${operatorId}`);
    
    return updatedLead;
  }

  /**
   * Eslatma qo'shish
   */
  async addNote(leadId: number, note: string, operatorId: number): Promise<Lead> {
    const lead = await this.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead topilmadi');
    }
    
    const timestamp = new Date().toLocaleString('uz-UZ');
    const oldNotes = lead.notes || '';
    lead.notes = oldNotes 
      ? `${oldNotes}\n[${timestamp}] ${note}`
      : `[${timestamp}] ${note}`;
    
    const updatedLead = await this.leadRepo.save(lead);
    this.logger.log(`📝 Eslatma qo'shildi: Lead #${leadId}`);
    
    return updatedLead;
  }

  /**
   * Eslatma belgilash (keyingi qo'ng'iroq uchun)
   */
  async setReminder(leadId: number, remindDate: Date, operatorId: number, note?: string): Promise<Lead> {
    const lead = await this.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead topilmadi');
    }
    
    lead.remindAt = remindDate;
    lead.reminded = false;
    lead.status = 'postponed';
    
    if (note) {
      lead.remindNote = note;
    }
    
    const updatedLead = await this.leadRepo.save(lead);
    this.logger.log(`⏰ Eslatma belgilandi: Lead #${leadId}, Vaqt: ${remindDate.toLocaleString('uz-UZ')}`);
    
    return updatedLead;
  }

  /**
   * Eslatma yuborilgan deb belgilash
   */
  async markReminderSent(leadId: number): Promise<Lead> {
    await this.leadRepo.update(leadId, { reminded: true });
    return this.findById(leadId);
  }

  /**
   * Eslatma vaqti kelgan leadlar
   */
  async getDueReminders(): Promise<Lead[]> {
    const now = new Date();
    
    return this.leadRepo.find({
      where: {
        remindAt: LessThan(now),
        reminded: false
      },
      relations: ['car', 'operator']
    });
  }

  /**
   * Lead tarixi (barcha o'zgarishlar)
   */
  async getLeadHistory(leadId: number): Promise<any[]> {
    const lead = await this.findWithFullInfo(leadId);
    
    if (!lead) {
      return [];
    }
    
    const history = [];
    
    // Lead yaratilgan vaqt
    history.push({
      createdAt: lead.createdAt,
      action: 'Lead yaratildi',
      description: `${lead.leadType} turida yaratildi`,
      operator: lead.operator?.firstName || 'Tayinlanmagan'
    });
    
    // Status o'zgarishlarini notes dan olish
    if (lead.notes) {
      const noteLines = lead.notes.split('\n');
      noteLines.forEach(line => {
        if (line.trim() && line.includes('[') && line.includes(']')) {
          const match = line.match(/\[(.*?)\]\s*(.*)/);
          if (match) {
            history.push({
              createdAt: new Date(match[1]),
              action: 'Eslatma',
              description: match[2],
              operator: lead.operator?.firstName
            });
          }
        }
      });
    }
    
    // Qo'ng'iroqlar
    if (lead.callCount > 0) {
      history.push({
        createdAt: lead.lastCallAt || lead.updatedAt,
        action: 'Qo\'ng\'iroq',
        description: `${lead.callCount} marta qo'ng'iroq qilingan, Oxirgisi: ${lead.callResult || 'Natija kiritilmagan'}`,
        operator: lead.operator?.firstName
      });
    }
    
    // Lead yopilgan
    if (lead.closedAt) {
      history.push({
        createdAt: lead.closedAt,
        action: 'Lead yopildi',
        description: 'Muvaffaqiyatli yakunlandi',
        operator: lead.operator?.firstName
      });
    }
    
    // Eslatmalar
    if (lead.remindAt) {
      history.push({
        createdAt: lead.remindAt,
        action: 'Eslatma vaqti',
        description: lead.remindNote || 'Eslatma belgilangan',
        operator: lead.operator?.firstName
      });
    }
    
    return history.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * SMS log
   */
  async logSms(leadId: number, smsText: string, operatorId: number): Promise<void> {
    this.logger.log(`📨 SMS yuborildi: Lead #${leadId}, Operator #${operatorId}`);
    
    // SMS ni eslatma sifatida saqlash
    await this.addNote(leadId, `SMS yuborildi: ${smsText}`, operatorId);
  }

  /**
   * Leadni to'liq ma'lumot bilan olish
   */
  async findWithFullInfo(leadId: number): Promise<Lead> {
    return this.leadRepo.findOne({
      where: { id: leadId },
      relations: ['car', 'insurance', 'operator']
    });
  }

  /**
   * Bugungi qo'ng'iroqlar
   */
  async getTodayCalls(operatorId: number): Promise<Lead[]> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.leadRepo.find({
      where: {
        operatorId,
        lastCallAt: Between(today, tomorrow)
      },
      relations: ['car'],
      order: { lastCallAt: 'DESC' }
    });
  }

  /**
   * Ertangi eslatmalar
   */
  async getTomorrowReminders(operatorId: number): Promise<Lead[]> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    return this.leadRepo.find({
      where: {
        operatorId,
        remindAt: Between(tomorrow, dayAfterTomorrow),
        reminded: false
      },
      relations: ['car']
    });
  }

  /**
   * Mijoz izohini qo'shish
   */
  async addCustomerComment(leadId: number, comment: string, operatorId: number): Promise<Lead> {
    const lead = await this.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead topilmadi');
    }
    
    lead.customerComment = comment;
    
    const updatedLead = await this.leadRepo.save(lead);
    this.logger.log(`💬 Mijoz izohi qo'shildi: Lead #${leadId}`);
    
    return updatedLead;
  }

  /**
   * Keyingi harakatni belgilash
   */
  async setNextAction(leadId: number, action: string, actionDate: Date, operatorId: number): Promise<Lead> {
    const lead = await this.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead topilmadi');
    }
    
    lead.nextAction = action;
    lead.nextActionDate = actionDate;
    
    const updatedLead = await this.leadRepo.save(lead);
    this.logger.log(`📅 Keyingi harakat belgilandi: Lead #${leadId} - ${action}`);
    
    return updatedLead;
  }

  /**
   * Keyingi harakat vaqti kelgan leadlar
   */
  async getDueNextActions(): Promise<Lead[]> {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.leadRepo.find({
      where: {
        nextActionDate: Between(now, endOfDay),
        status: Not('closed')
      },
      relations: ['car', 'operator']
    });
  }

  /**
   * Operatorning qo'ng'iroq statistikasi
   */
  async getCallStats(operatorId: number, period: 'day' | 'week' | 'month' = 'month'): Promise<any> {
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
      default:
        startDate = DateUtil.getMonthStart();
    }

    const leads = await this.leadRepo.find({
      where: {
        operatorId,
        callCount: MoreThan(0),
        lastCallAt: Between(startDate, endDate)
      }
    });

    const totalCalls = leads.reduce((sum, l) => sum + (l.callCount || 0), 0);
    const avgDuration = leads.length > 0 
      ? Math.round(leads.reduce((sum, l) => sum + (l.callDuration || 0), 0) / leads.length)
      : 0;

    return {
      period,
      totalLeads: leads.length,
      totalCalls,
      avgCallsPerLead: leads.length > 0 ? Math.round(totalCalls / leads.length) : 0,
      avgDuration,
      successRate: leads.filter(l => l.status === 'closed').length / leads.length * 100 || 0
    };
  }

  /**
   * Eslatmalarni tozalash (o'tgan eslatmalar)
   */
  async cleanOldReminders(days: number = 7): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await this.leadRepo
      .createQueryBuilder()
      .update()
      .set({ reminded: true })
      .where('remindAt < :date', { date })
      .andWhere('reminded = :reminded', { reminded: false })
      .execute();

    this.logger.log(`🧹 ${result.affected || 0} ta eski eslatma tozalandi`);
    
    return result.affected || 0;
  }

  /**
   * Operatorning kunlik rejasi
   */
  async getOperatorDailyPlan(operatorId: number): Promise<any> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      newLeads,
      postponedLeads,
      dueReminders,
      completedToday,
      totalCalls
    ] = await Promise.all([
      this.leadRepo.count({
        where: {
          operatorId,
          status: 'new',
          createdAt: Between(today, tomorrow)
        }
      }),
      this.leadRepo.count({
        where: {
          operatorId,
          status: 'postponed'
        }
      }),
      this.leadRepo.count({
        where: {
          operatorId,
          remindAt: Between(today, tomorrow),
          reminded: false
        }
      }),
      this.leadRepo.count({
        where: {
          operatorId,
          status: 'closed',
          updatedAt: Between(today, tomorrow)
        }
      }),
      this.leadRepo
        .createQueryBuilder('lead')
        .where('lead.operatorId = :operatorId', { operatorId })
        .andWhere('lead.lastCallAt BETWEEN :today AND :tomorrow', { today, tomorrow })
        .select('SUM(lead.callCount)', 'total')
        .getRawOne()
    ]);

    return {
      date: today,
      newLeads: newLeads || 0,
      postponedLeads: postponedLeads || 0,
      dueReminders: dueReminders || 0,
      completedToday: completedToday || 0,
      totalCalls: parseInt(totalCalls?.total) || 0,
      productivity: completedToday > 0 ? Math.round((completedToday / (newLeads + 1)) * 100) : 0
    };
  }
}
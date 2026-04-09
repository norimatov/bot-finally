import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between } from 'typeorm';
import { Kpi } from '../entities/kpi.entity';
import { DateUtil } from '../../common/utils/date.util';

@Injectable()
export class KpiRepository extends Repository<Kpi> {
  constructor(private dataSource: DataSource) {
    super(Kpi, dataSource.createEntityManager());
  }

  async getTodayStats(userId: number): Promise<{ count: number; total: number }> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const kpis = await this.find({
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

    const kpis = await this.find({
      where: {
        userId: userId,
        createdAt: Between(monthStart, new Date())
      }
    });

    return {
      count: kpis.length,
      total: kpis.reduce((sum, k) => sum + Number(k.amount), 0)
    };
  }
}
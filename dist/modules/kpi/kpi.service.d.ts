import { Repository } from 'typeorm';
import { Kpi } from '../../database/entities/kpi.entity';
import { User } from '../../database/entities/user.entity';
import { DailyStat } from '../../database/entities/daily-stat.entity';
export declare class KpiService {
    private kpiRepo;
    private userRepo;
    private dailyStatRepo;
    constructor(kpiRepo: Repository<Kpi>, userRepo: Repository<User>, dailyStatRepo: Repository<DailyStat>);
    addRegistrarKpi(userId: number, carId: number): Promise<Kpi>;
    addOperatorKpi(userId: number, leadId: number, amount: number): Promise<Kpi>;
    private updateDailyStat;
    getTodayStats(userId: number): Promise<{
        count: number;
        total: number;
    }>;
    getMonthStats(userId: number): Promise<{
        count: number;
        total: number;
    }>;
    getUserRating(): Promise<any[]>;
    getTodayTotal(): Promise<number>;
    getMonthTotal(): Promise<number>;
    getPendingPayments(): Promise<any[]>;
    getYearStats(): Promise<any>;
    getOperatorKpiDistribution(): Promise<any[]>;
    getGlobalKpiStats(): Promise<any>;
    cleanOldKpis(days?: number): Promise<number>;
    getDailyKpiReport(date?: Date): Promise<any>;
    getKpiStats(period?: 'day' | 'week' | 'month' | 'year'): Promise<any>;
    getUserStats(userId: number): Promise<any>;
    calculateMonthlyKpi(): Promise<any>;
    getSettings(): Promise<any>;
    getNotificationSettings(): Promise<any>;
    createBackup(): Promise<string>;
    calculateLeadAmount(leadType: string): number;
    private getPeriodMessage;
}

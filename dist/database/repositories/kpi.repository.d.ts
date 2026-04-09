import { DataSource, Repository } from 'typeorm';
import { Kpi } from '../entities/kpi.entity';
export declare class KpiRepository extends Repository<Kpi> {
    private dataSource;
    constructor(dataSource: DataSource);
    getTodayStats(userId: number): Promise<{
        count: number;
        total: number;
    }>;
    getMonthStats(userId: number): Promise<{
        count: number;
        total: number;
    }>;
}

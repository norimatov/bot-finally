import { KpiService } from './kpi.service';
export declare class KpiController {
    private readonly kpiService;
    constructor(kpiService: KpiService);
    getUserStats(userId: string): Promise<{
        today: {
            count: number;
            total: number;
        };
        month: {
            count: number;
            total: number;
        };
    }>;
    getRating(): Promise<any[]>;
}

import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Car } from '../../database/entities/car.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { Lead } from '../../database/entities/lead.entity';
import { Kpi } from '../../database/entities/kpi.entity';
import { DailyStat } from '../../database/entities/daily-stat.entity';
import { ExcelService } from '../../shared/exel/exel.service';
import { KpiService } from '../kpi/kpi.service';
export declare class AdminService {
    private userRepo;
    private carRepo;
    private insuranceRepo;
    private leadRepo;
    private kpiRepo;
    private dailyStatRepo;
    private excelService;
    private kpiService;
    constructor(userRepo: Repository<User>, carRepo: Repository<Car>, insuranceRepo: Repository<CarInsurance>, leadRepo: Repository<Lead>, kpiRepo: Repository<Kpi>, dailyStatRepo: Repository<DailyStat>, excelService: ExcelService, kpiService: KpiService);
    getTodayStats(): Promise<any>;
    getMonthStats(): Promise<any>;
    getUserRating(): Promise<any[]>;
    getPayments(): Promise<any[]>;
    exportToExcel(type: string): Promise<Buffer>;
    getUserStats(userId: number): Promise<any>;
}

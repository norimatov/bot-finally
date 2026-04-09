import { Response } from 'express';
import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getTodayStats(): Promise<any>;
    getMonthStats(): Promise<any>;
    getUserRating(): Promise<any[]>;
    getPayments(): Promise<any[]>;
    getUserStats(userId: string): Promise<any>;
    exportExcel(type: string, res: Response): Promise<void>;
}

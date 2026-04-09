"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const car_entity_1 = require("../../database/entities/car.entity");
const insurance_entity_1 = require("../../database/entities/insurance.entity");
const lead_entity_1 = require("../../database/entities/lead.entity");
const kpi_entity_1 = require("../../database/entities/kpi.entity");
const daily_stat_entity_1 = require("../../database/entities/daily-stat.entity");
const date_util_1 = require("../../common/utils/date.util");
const kpi_constants_1 = require("../../common/constants/kpi.constants");
const exel_service_1 = require("../../shared/exel/exel.service");
const kpi_service_1 = require("../kpi/kpi.service");
let AdminService = class AdminService {
    constructor(userRepo, carRepo, insuranceRepo, leadRepo, kpiRepo, dailyStatRepo, excelService, kpiService) {
        this.userRepo = userRepo;
        this.carRepo = carRepo;
        this.insuranceRepo = insuranceRepo;
        this.leadRepo = leadRepo;
        this.kpiRepo = kpiRepo;
        this.dailyStatRepo = dailyStatRepo;
        this.excelService = excelService;
        this.kpiService = kpiService;
    }
    async getTodayStats() {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [carsCount, insurancesCount, leadsCount, dailyStats, kpis] = await Promise.all([
            this.carRepo.count({ where: { createdAt: (0, typeorm_2.Between)(today, tomorrow) } }),
            this.insuranceRepo.count({ where: { createdAt: (0, typeorm_2.Between)(today, tomorrow) } }),
            this.leadRepo.count({ where: { createdAt: (0, typeorm_2.Between)(today, tomorrow) } }),
            this.dailyStatRepo.find({
                where: { date: today },
                relations: ['user']
            }),
            this.kpiRepo.find({ where: { createdAt: (0, typeorm_2.Between)(today, tomorrow) } })
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
    async getMonthStats() {
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const today = new Date();
        const dailyStats = await this.dailyStatRepo.find({
            where: { date: (0, typeorm_2.Between)(monthStart, today) },
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
    async getUserRating() {
        const users = await this.userRepo.find({
            where: { isActive: true },
            relations: ['kpis']
        });
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const rating = users.map(user => {
            const monthKpis = user.kpis?.filter(k => new Date(k.createdAt) >= monthStart) || [];
            const carsAdded = monthKpis.filter(k => k.actionType === kpi_constants_1.KPI.actions.addCar).length;
            const leadsClosed = monthKpis.filter(k => k.actionType === kpi_constants_1.KPI.actions.closeLead).length;
            const totalEarned = monthKpis.reduce((sum, k) => sum + Number(k.amount), 0);
            let amount = 0;
            if (user.role === 'registrar') {
                amount = carsAdded * kpi_constants_1.KPI.registrar.perCar;
            }
            else if (user.role === 'operator') {
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
    async getPayments() {
        const users = await this.userRepo.find({
            where: { isActive: true },
            relations: ['kpis']
        });
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const monthEnd = date_util_1.DateUtil.getMonthEnd();
        return users.map(user => {
            const monthKpis = user.kpis?.filter(k => new Date(k.createdAt) >= monthStart && new Date(k.createdAt) <= monthEnd) || [];
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
    async exportToExcel(type) {
        let data = [];
        if (type === 'users') {
            data = await this.getUserRating();
        }
        else if (type === 'payments') {
            data = await this.getPayments();
        }
        else {
            const stats = await this.getMonthStats();
            data = stats.daily;
        }
        return this.excelService.exportToExcel(data, type);
    }
    async getUserStats(userId) {
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(car_entity_1.Car)),
    __param(2, (0, typeorm_1.InjectRepository)(insurance_entity_1.CarInsurance)),
    __param(3, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __param(4, (0, typeorm_1.InjectRepository)(kpi_entity_1.Kpi)),
    __param(5, (0, typeorm_1.InjectRepository)(daily_stat_entity_1.DailyStat)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        exel_service_1.ExcelService,
        kpi_service_1.KpiService])
], AdminService);
//# sourceMappingURL=admin.service.js.map
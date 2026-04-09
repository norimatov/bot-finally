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
exports.KpiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const kpi_entity_1 = require("../../database/entities/kpi.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const daily_stat_entity_1 = require("../../database/entities/daily-stat.entity");
const kpi_constants_1 = require("../../common/constants/kpi.constants");
const date_util_1 = require("../../common/utils/date.util");
let KpiService = class KpiService {
    constructor(kpiRepo, userRepo, dailyStatRepo) {
        this.kpiRepo = kpiRepo;
        this.userRepo = userRepo;
        this.dailyStatRepo = dailyStatRepo;
    }
    async addRegistrarKpi(userId, carId) {
        const kpi = new kpi_entity_1.Kpi();
        kpi.userId = userId;
        kpi.actionType = kpi_constants_1.KPI.actions.addCar;
        kpi.points = 1;
        kpi.amount = kpi_constants_1.KPI.registrar.perCar;
        kpi.referenceId = carId;
        kpi.referenceType = 'car';
        const savedKpi = await this.kpiRepo.save(kpi);
        await this.updateDailyStat(userId, 'car', kpi_constants_1.KPI.registrar.perCar);
        return savedKpi;
    }
    async addOperatorKpi(userId, leadId, amount) {
        const kpi = new kpi_entity_1.Kpi();
        kpi.userId = userId;
        kpi.actionType = kpi_constants_1.KPI.actions.closeLead;
        kpi.points = 1;
        kpi.amount = amount;
        kpi.referenceId = leadId;
        kpi.referenceType = 'lead';
        const savedKpi = await this.kpiRepo.save(kpi);
        await this.updateDailyStat(userId, 'lead', amount);
        return savedKpi;
    }
    async updateDailyStat(userId, type, amount) {
        const today = date_util_1.DateUtil.getToday();
        let dailyStat = await this.dailyStatRepo.findOne({
            where: {
                userId: userId,
                date: today
            }
        });
        if (!dailyStat) {
            dailyStat = new daily_stat_entity_1.DailyStat();
            dailyStat.userId = userId;
            dailyStat.date = today;
            dailyStat.carsAdded = 0;
            dailyStat.leadsClosed = 0;
            dailyStat.totalEarned = 0;
        }
        if (type === 'car') {
            dailyStat.carsAdded += 1;
        }
        else {
            dailyStat.leadsClosed += 1;
        }
        dailyStat.totalEarned = Number(dailyStat.totalEarned) + amount;
        await this.dailyStatRepo.save(dailyStat);
    }
    async getTodayStats(userId) {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const kpis = await this.kpiRepo.find({
            where: {
                userId: userId,
                createdAt: (0, typeorm_2.Between)(today, tomorrow)
            }
        });
        return {
            count: kpis.length,
            total: kpis.reduce((sum, k) => sum + Number(k.amount), 0)
        };
    }
    async getMonthStats(userId) {
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const kpis = await this.kpiRepo.find({
            where: {
                userId: userId,
                createdAt: (0, typeorm_2.MoreThanOrEqual)(monthStart)
            }
        });
        return {
            count: kpis.length,
            total: kpis.reduce((sum, k) => sum + Number(k.amount), 0)
        };
    }
    async getUserRating() {
        const users = await this.userRepo.find({
            where: { isActive: true },
            relations: ['kpis']
        });
        const monthStart = date_util_1.DateUtil.getMonthStart();
        return users.map(user => {
            const monthKpis = user.kpis?.filter(k => new Date(k.createdAt) >= monthStart) || [];
            const carsAdded = monthKpis.filter(k => k.actionType === kpi_constants_1.KPI.actions.addCar).length;
            const leadsClosed = monthKpis.filter(k => k.actionType === kpi_constants_1.KPI.actions.closeLead).length;
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
    async getTodayTotal() {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const kpis = await this.kpiRepo.find({
            where: {
                createdAt: (0, typeorm_2.Between)(today, tomorrow)
            }
        });
        return kpis.reduce((sum, k) => sum + Number(k.amount), 0);
    }
    async getMonthTotal() {
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const kpis = await this.kpiRepo.find({
            where: {
                createdAt: (0, typeorm_2.MoreThanOrEqual)(monthStart)
            }
        });
        return kpis.reduce((sum, k) => sum + Number(k.amount), 0);
    }
    async getPendingPayments() {
        const operators = await this.userRepo.find({
            where: {
                role: 'operator',
                isActive: true
            },
            relations: ['kpis']
        });
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const monthEnd = date_util_1.DateUtil.getMonthEnd();
        const payments = operators.map(operator => {
            const monthKpis = operator.kpis?.filter(k => new Date(k.createdAt) >= monthStart && new Date(k.createdAt) <= monthEnd) || [];
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
    async getYearStats() {
        const year = new Date().getFullYear();
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31, 23, 59, 59);
        const kpis = await this.kpiRepo.find({
            where: {
                createdAt: (0, typeorm_2.Between)(yearStart, yearEnd)
            },
            relations: ['user']
        });
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
            const monthKpis = kpis.filter(k => new Date(k.createdAt) >= monthStart && new Date(k.createdAt) <= monthEnd);
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
                registrar: kpis.filter(k => k.actionType === kpi_constants_1.KPI.actions.addCar).length,
                operator: kpis.filter(k => k.actionType === kpi_constants_1.KPI.actions.closeLead).length
            },
            message: null
        };
    }
    async getOperatorKpiDistribution() {
        const operators = await this.userRepo.find({
            where: {
                role: 'operator',
                isActive: true
            },
            relations: ['kpis']
        });
        const monthStart = date_util_1.DateUtil.getMonthStart();
        return operators.map(operator => {
            const monthKpis = operator.kpis?.filter(k => new Date(k.createdAt) >= monthStart) || [];
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
    async getGlobalKpiStats() {
        const today = date_util_1.DateUtil.getToday();
        const monthStart = date_util_1.DateUtil.getMonthStart();
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
    async cleanOldKpis(days = 90) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        const result = await this.kpiRepo.delete({
            createdAt: (0, typeorm_2.LessThan)(date)
        });
        return result.affected || 0;
    }
    async getDailyKpiReport(date) {
        const reportDate = date || date_util_1.DateUtil.getToday();
        const nextDay = new Date(reportDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const kpis = await this.kpiRepo.find({
            where: {
                createdAt: (0, typeorm_2.Between)(reportDate, nextDay)
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
    async getKpiStats(period = 'month') {
        let startDate;
        const endDate = new Date();
        switch (period) {
            case 'day':
                startDate = date_util_1.DateUtil.getToday();
                break;
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = date_util_1.DateUtil.getMonthStart();
                break;
            case 'year':
                startDate = new Date(new Date().getFullYear(), 0, 1);
                break;
            default:
                startDate = date_util_1.DateUtil.getMonthStart();
        }
        const kpis = await this.kpiRepo.find({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate)
            },
            relations: ['user']
        });
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
                registrar: kpis.filter(k => k.actionType === kpi_constants_1.KPI.actions.addCar).length,
                operator: kpis.filter(k => k.actionType === kpi_constants_1.KPI.actions.closeLead).length
            },
            message: null
        };
    }
    async getUserStats(userId) {
        const [today, month, total] = await Promise.all([
            this.getTodayStats(userId),
            this.getMonthStats(userId),
            this.kpiRepo.find({ where: { userId } })
        ]);
        return {
            carsCount: total.filter(k => k.actionType === kpi_constants_1.KPI.actions.addCar).length,
            totalEarned: total.reduce((sum, k) => sum + Number(k.amount), 0),
            today: today.count,
            month: month.count
        };
    }
    async calculateMonthlyKpi() {
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const monthEnd = date_util_1.DateUtil.getMonthEnd();
        const kpis = await this.kpiRepo.find({
            where: {
                createdAt: (0, typeorm_2.Between)(monthStart, monthEnd)
            },
            relations: ['user']
        });
        const total = kpis.reduce((sum, k) => sum + Number(k.amount), 0);
        const employees = new Set(kpis.map(k => k.userId)).size;
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
    async getSettings() {
        return {
            registrarRate: 2500,
            hotRate: 7000,
            warmRate: 5000,
            coldRate: 3000
        };
    }
    async getNotificationSettings() {
        return {
            enabled: true,
            notifyDays: [10, 5, 1]
        };
    }
    async createBackup() {
        const backupPath = `/tmp/backup_${Date.now()}.json`;
        const [kpis, users] = await Promise.all([
            this.kpiRepo.find(),
            this.userRepo.find()
        ]);
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
    calculateLeadAmount(leadType) {
        const amounts = {
            'HOT': 7000,
            'WARM': 5000,
            'COLD': 3000
        };
        return amounts[leadType] || 5000;
    }
    getPeriodMessage(period) {
        const messages = {
            day: 'Bugungi kun uchun KPI maʼlumotlari mavjud emas',
            week: 'Oxirgi 7 kun uchun KPI maʼlumotlari mavjud emas',
            month: 'Bu oy uchun KPI maʼlumotlari mavjud emas',
            year: `${new Date().getFullYear()} yil uchun KPI maʼlumotlari mavjud emas`
        };
        return messages[period] || 'Maʼlumotlar mavjud emas';
    }
};
exports.KpiService = KpiService;
exports.KpiService = KpiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(kpi_entity_1.Kpi)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(daily_stat_entity_1.DailyStat)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], KpiService);
//# sourceMappingURL=kpi.service.js.map
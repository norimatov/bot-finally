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
var LeadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("../../database/entities/lead.entity");
const insurance_entity_1 = require("../../database/entities/insurance.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const car_entity_1 = require("../../database/entities/car.entity");
const kpi_service_1 = require("../kpi/kpi.service");
const date_util_1 = require("../../common/utils/date.util");
const bot_service_1 = require("../bot/bot.service");
let LeadService = LeadService_1 = class LeadService {
    constructor(leadRepo, insuranceRepo, userRepo, carRepo, kpiService, botService) {
        this.leadRepo = leadRepo;
        this.insuranceRepo = insuranceRepo;
        this.userRepo = userRepo;
        this.carRepo = carRepo;
        this.kpiService = kpiService;
        this.botService = botService;
        this.logger = new common_1.Logger(LeadService_1.name);
    }
    async createLead(data) {
        const lead = new lead_entity_1.Lead();
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
    async createLeadsForInsurance(insurance) {
        const daysLeft = date_util_1.DateUtil.daysRemaining(insurance.endDate);
        let leadType;
        if (daysLeft <= 10)
            leadType = 'HOT';
        else if (daysLeft <= 30)
            leadType = 'WARM';
        else
            leadType = 'COLD';
        const operators = await this.userRepo.find({
            where: {
                role: 'operator',
                isActive: true
            }
        });
        const leads = [];
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
    async getHotLeads(operatorId) {
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
    async getHotLeadsCount(operatorId) {
        return this.leadRepo.count({
            where: {
                operatorId,
                leadType: 'HOT',
                status: 'new'
            }
        });
    }
    async getWarmLeads(operatorId) {
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
    async getWarmLeadsCount(operatorId) {
        return this.leadRepo.count({
            where: {
                operatorId,
                leadType: 'WARM',
                status: 'new'
            }
        });
    }
    async getColdLeads(operatorId) {
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
    async getColdLeadsCount(operatorId) {
        return this.leadRepo.count({
            where: {
                operatorId,
                leadType: 'COLD',
                status: 'new'
            }
        });
    }
    async getOperatorLeads(operatorId) {
        return this.leadRepo.find({
            where: { operatorId },
            relations: ['car', 'insurance'],
            order: { createdAt: 'DESC' }
        });
    }
    async updateLeadStatus(leadId, status, operatorId, notes) {
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
            if (lead.leadType === 'HOT')
                amount = 7000;
            else if (lead.leadType === 'WARM')
                amount = 5000;
            else if (lead.leadType === 'COLD')
                amount = 3000;
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
    async bulkUpdateStatus(leadIds, status, operatorId) {
        let updated = 0;
        for (const leadId of leadIds) {
            try {
                await this.updateLeadStatus(leadId, status, operatorId);
                updated++;
            }
            catch (error) {
                this.logger.error(`Lead #${leadId} yangilashda xatolik: ${error.message}`);
            }
        }
        return updated;
    }
    async assignLead(leadId, operatorId) {
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
    async getExpiredLeads() {
        const today = new Date();
        return this.leadRepo.find({
            where: {
                insurance: {
                    endDate: (0, typeorm_2.LessThan)(today)
                },
                status: 'new'
            },
            relations: ['insurance', 'car']
        });
    }
    async getExpiringLeads(days) {
        const targetDate = date_util_1.DateUtil.getDateRange(days);
        return this.leadRepo.find({
            where: {
                insurance: {
                    endDate: (0, typeorm_2.LessThan)(targetDate)
                },
                status: 'new'
            },
            relations: ['insurance', 'car']
        });
    }
    async getOperatorStats(operatorId) {
        const leads = await this.leadRepo.find({
            where: { operatorId }
        });
        const today = date_util_1.DateUtil.getToday();
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const todayLeads = leads.filter(l => new Date(l.createdAt) >= today);
        const monthLeads = leads.filter(l => new Date(l.createdAt) >= monthStart);
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
    async calculateAvgResponseTime(operatorId) {
        const leads = await this.leadRepo.find({
            where: {
                operatorId,
                status: 'closed'
            }
        });
        if (leads.length === 0)
            return 0;
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
    async calculateHotConversion(operatorId) {
        const hotLeads = await this.leadRepo.find({
            where: {
                operatorId,
                leadType: 'HOT'
            }
        });
        if (hotLeads.length === 0)
            return 0;
        const closedHotLeads = hotLeads.filter(l => l.status === 'closed').length;
        return Number(((closedHotLeads / hotLeads.length) * 100).toFixed(1));
    }
    async getOperatorsRating() {
        const operators = await this.userRepo.find({
            where: {
                role: 'operator',
                isActive: true
            },
            relations: ['leads']
        });
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const rating = operators.map(operator => {
            const monthLeads = operator.leads?.filter(l => new Date(l.createdAt) >= monthStart) || [];
            const closedLeads = monthLeads.filter(l => l.status === 'closed');
            const hotClosed = closedLeads.filter(l => l.leadType === 'HOT').length;
            const warmClosed = closedLeads.filter(l => l.leadType === 'WARM').length;
            const coldClosed = closedLeads.filter(l => l.leadType === 'COLD').length;
            const totalAmount = hotClosed * 7000 +
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
    async searchLeads(query) {
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
    async softDeleteLead(leadId) {
        await this.leadRepo.update(leadId, {
            status: 'rejected',
            notes: 'Lead o\'chirildi',
            updatedAt: new Date()
        });
        this.logger.log(`🗑️ Lead #${leadId} o'chirildi`);
    }
    async getDailyReport(date) {
        const reportDate = date || date_util_1.DateUtil.getToday();
        const nextDay = new Date(reportDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const leads = await this.leadRepo.find({
            where: {
                createdAt: (0, typeorm_2.Between)(reportDate, nextDay)
            },
            relations: ['operator', 'car']
        });
        const byOperator = {};
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
    async reopenLead(leadId) {
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
    async cleanOldLeads(days = 30) {
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
    async clearLeadStats(operatorId) {
        await this.leadRepo.update({ operatorId, status: 'closed' }, { status: 'rejected', notes: 'Statistika tozalandi', updatedAt: new Date() });
        this.logger.log(`🧹 Operator #${operatorId} statistikasi tozalandi`);
    }
    async exportLeads(operatorId) {
        const where = operatorId ? { operatorId } : {};
        return this.leadRepo.find({
            where,
            relations: ['car', 'insurance', 'operator'],
            order: { createdAt: 'DESC' }
        });
    }
    async getTodayCount() {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.leadRepo.count({
            where: {
                createdAt: (0, typeorm_2.Between)(today, tomorrow)
            }
        });
    }
    async getMonthCount() {
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const monthEnd = date_util_1.DateUtil.getMonthEnd();
        return this.leadRepo.count({
            where: {
                createdAt: (0, typeorm_2.Between)(monthStart, monthEnd)
            }
        });
    }
    async getTopOperator() {
        const operators = await this.userRepo.find({
            where: {
                role: 'operator',
                isActive: true
            },
            relations: ['leads']
        });
        const monthStart = date_util_1.DateUtil.getMonthStart();
        let topOperator = {
            id: 0,
            name: 'Mavjud emas',
            leads: 0,
            amount: 0,
            calls: 0
        };
        for (const operator of operators) {
            const monthLeads = operator.leads?.filter(l => new Date(l.createdAt) >= monthStart && l.status === 'closed') || [];
            const totalAmount = monthLeads.reduce((sum, l) => {
                if (l.leadType === 'HOT')
                    return sum + 7000;
                if (l.leadType === 'WARM')
                    return sum + 5000;
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
    async getLeadAnalytics(period = 'month') {
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
        const leads = await this.leadRepo.find({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate)
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
        const dailyData = {};
        const operatorData = {};
        leads.forEach(lead => {
            const date = lead.createdAt.toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = { total: 0, hot: 0, warm: 0, cold: 0, closed: 0, calls: 0 };
            }
            dailyData[date].total++;
            dailyData[date][lead.leadType.toLowerCase()]++;
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
    async getMonthlyLeadStats() {
        const year = new Date().getFullYear();
        const monthlyStats = [];
        for (let i = 0; i < 12; i++) {
            const monthStart = new Date(year, i, 1);
            const monthEnd = new Date(year, i + 1, 0, 23, 59, 59);
            const count = await this.leadRepo.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(monthStart, monthEnd)
                }
            });
            const closedCount = await this.leadRepo.count({
                where: {
                    createdAt: (0, typeorm_2.Between)(monthStart, monthEnd),
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
    getPeriodMessage(period) {
        const messages = {
            day: 'Bugungi kun uchun lead maʼlumotlari mavjud emas',
            week: 'Oxirgi 7 kun uchun lead maʼlumotlari mavjud emas',
            month: 'Bu oy uchun lead maʼlumotlari mavjud emas',
            year: `${new Date().getFullYear()} yil uchun lead maʼlumotlari mavjud emas`
        };
        return messages[period] || 'Maʼlumotlar mavjud emas';
    }
    async assignLeadsToOperators() {
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
    async getGlobalStats() {
        const today = date_util_1.DateUtil.getToday();
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        const [todayCount, monthCount, yearCount, totalCount, byType, totalCalls] = await Promise.all([
            this.getTodayCount(),
            this.getMonthCount(),
            this.leadRepo.count({ where: { createdAt: (0, typeorm_2.Between)(yearStart, new Date()) } }),
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
    async getLeadTypeStats() {
        const hot = await this.leadRepo.count({ where: { leadType: 'HOT' } });
        const warm = await this.leadRepo.count({ where: { leadType: 'WARM' } });
        const cold = await this.leadRepo.count({ where: { leadType: 'COLD' } });
        return { hot, warm, cold };
    }
    async getLeadsByStatus(status) {
        return this.leadRepo.find({
            where: { status },
            relations: ['car', 'insurance', 'operator'],
            order: { createdAt: 'DESC' }
        });
    }
    async getOperatorPerformance(operatorId, period = 'month') {
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
            default:
                startDate = date_util_1.DateUtil.getMonthStart();
        }
        const leads = await this.leadRepo.find({
            where: {
                operatorId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate)
            },
            relations: ['car']
        });
        const closed = leads.filter(l => l.status === 'closed');
        const revenue = closed.reduce((sum, l) => {
            if (l.leadType === 'HOT')
                return sum + 7000;
            if (l.leadType === 'WARM')
                return sum + 5000;
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
    async findById(leadId) {
        return this.leadRepo.findOne({
            where: { id: leadId },
            relations: ['car', 'insurance', 'operator']
        });
    }
    async getOperatorCallHistory(operatorId, limit = 50) {
        return this.leadRepo.find({
            where: {
                operatorId,
                callCount: (0, typeorm_2.MoreThan)(0)
            },
            relations: ['car'],
            order: { lastCallAt: 'DESC' },
            take: limit
        });
    }
    async getTodayLeads(operatorId) {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.leadRepo.find({
            where: {
                operatorId,
                createdAt: (0, typeorm_2.Between)(today, tomorrow)
            },
            relations: ['car'],
            order: { createdAt: 'ASC' }
        });
    }
    async getTodayCompleted(operatorId) {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.leadRepo.find({
            where: {
                operatorId,
                status: 'closed',
                updatedAt: (0, typeorm_2.Between)(today, tomorrow)
            },
            relations: ['car']
        });
    }
    async getTodayPostponed(operatorId) {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.leadRepo.find({
            where: {
                operatorId,
                status: 'postponed',
                updatedAt: (0, typeorm_2.Between)(today, tomorrow)
            },
            relations: ['car']
        });
    }
    async logCall(leadId, operatorId, duration, result) {
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
    async addNote(leadId, note, operatorId) {
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
    async setReminder(leadId, remindDate, operatorId, note) {
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
    async markReminderSent(leadId) {
        await this.leadRepo.update(leadId, { reminded: true });
        return this.findById(leadId);
    }
    async getDueReminders() {
        const now = new Date();
        return this.leadRepo.find({
            where: {
                remindAt: (0, typeorm_2.LessThan)(now),
                reminded: false
            },
            relations: ['car', 'operator']
        });
    }
    async getLeadHistory(leadId) {
        const lead = await this.findWithFullInfo(leadId);
        if (!lead) {
            return [];
        }
        const history = [];
        history.push({
            createdAt: lead.createdAt,
            action: 'Lead yaratildi',
            description: `${lead.leadType} turida yaratildi`,
            operator: lead.operator?.firstName || 'Tayinlanmagan'
        });
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
        if (lead.callCount > 0) {
            history.push({
                createdAt: lead.lastCallAt || lead.updatedAt,
                action: 'Qo\'ng\'iroq',
                description: `${lead.callCount} marta qo'ng'iroq qilingan, Oxirgisi: ${lead.callResult || 'Natija kiritilmagan'}`,
                operator: lead.operator?.firstName
            });
        }
        if (lead.closedAt) {
            history.push({
                createdAt: lead.closedAt,
                action: 'Lead yopildi',
                description: 'Muvaffaqiyatli yakunlandi',
                operator: lead.operator?.firstName
            });
        }
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
    async logSms(leadId, smsText, operatorId) {
        this.logger.log(`📨 SMS yuborildi: Lead #${leadId}, Operator #${operatorId}`);
        await this.addNote(leadId, `SMS yuborildi: ${smsText}`, operatorId);
    }
    async findWithFullInfo(leadId) {
        return this.leadRepo.findOne({
            where: { id: leadId },
            relations: ['car', 'insurance', 'operator']
        });
    }
    async getTodayCalls(operatorId) {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.leadRepo.find({
            where: {
                operatorId,
                lastCallAt: (0, typeorm_2.Between)(today, tomorrow)
            },
            relations: ['car'],
            order: { lastCallAt: 'DESC' }
        });
    }
    async getTomorrowReminders(operatorId) {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        return this.leadRepo.find({
            where: {
                operatorId,
                remindAt: (0, typeorm_2.Between)(tomorrow, dayAfterTomorrow),
                reminded: false
            },
            relations: ['car']
        });
    }
    async addCustomerComment(leadId, comment, operatorId) {
        const lead = await this.findById(leadId);
        if (!lead) {
            throw new Error('Lead topilmadi');
        }
        lead.customerComment = comment;
        const updatedLead = await this.leadRepo.save(lead);
        this.logger.log(`💬 Mijoz izohi qo'shildi: Lead #${leadId}`);
        return updatedLead;
    }
    async setNextAction(leadId, action, actionDate, operatorId) {
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
    async getDueNextActions() {
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        return this.leadRepo.find({
            where: {
                nextActionDate: (0, typeorm_2.Between)(now, endOfDay),
                status: (0, typeorm_2.Not)('closed')
            },
            relations: ['car', 'operator']
        });
    }
    async getCallStats(operatorId, period = 'month') {
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
            default:
                startDate = date_util_1.DateUtil.getMonthStart();
        }
        const leads = await this.leadRepo.find({
            where: {
                operatorId,
                callCount: (0, typeorm_2.MoreThan)(0),
                lastCallAt: (0, typeorm_2.Between)(startDate, endDate)
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
    async cleanOldReminders(days = 7) {
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
    async getOperatorDailyPlan(operatorId) {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [newLeads, postponedLeads, dueReminders, completedToday, totalCalls] = await Promise.all([
            this.leadRepo.count({
                where: {
                    operatorId,
                    status: 'new',
                    createdAt: (0, typeorm_2.Between)(today, tomorrow)
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
                    remindAt: (0, typeorm_2.Between)(today, tomorrow),
                    reminded: false
                }
            }),
            this.leadRepo.count({
                where: {
                    operatorId,
                    status: 'closed',
                    updatedAt: (0, typeorm_2.Between)(today, tomorrow)
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
};
exports.LeadService = LeadService;
exports.LeadService = LeadService = LeadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __param(1, (0, typeorm_1.InjectRepository)(insurance_entity_1.CarInsurance)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(car_entity_1.Car)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        kpi_service_1.KpiService,
        bot_service_1.BotService])
], LeadService);
//# sourceMappingURL=lead.service.js.map
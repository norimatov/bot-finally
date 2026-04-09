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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../../database/entities/notification.entity");
const insurance_entity_1 = require("../../database/entities/insurance.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const lead_entity_1 = require("../../database/entities/lead.entity");
const date_util_1 = require("../../common/utils/date.util");
const kpi_constants_1 = require("../../common/constants/kpi.constants");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notifRepo, insuranceRepo, userRepo, leadRepo) {
        this.notifRepo = notifRepo;
        this.insuranceRepo = insuranceRepo;
        this.userRepo = userRepo;
        this.leadRepo = leadRepo;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async checkExpiringInsurances() {
        const insurances = await this.insuranceRepo.find({
            where: { status: 'active' },
            relations: ['car']
        });
        for (const insurance of insurances) {
            const daysLeft = date_util_1.DateUtil.daysRemaining(insurance.endDate);
            if (kpi_constants_1.KPI.notificationDays.includes(daysLeft)) {
                await this.createNotificationsForInsurance(insurance, daysLeft);
            }
        }
    }
    async createNotificationsForInsurance(insurance, daysLeft) {
        const operators = await this.userRepo.find({
            where: {
                role: 'operator',
                isActive: true
            }
        });
        let leadType = 'COLD';
        if (daysLeft <= kpi_constants_1.KPI.leadTypes.hot.days)
            leadType = 'HOT';
        else if (daysLeft <= kpi_constants_1.KPI.leadTypes.warm.days)
            leadType = 'WARM';
        for (const operator of operators) {
            const existingLead = await this.leadRepo.findOne({
                where: {
                    insuranceId: insurance.id,
                    operatorId: operator.id,
                    status: 'new'
                }
            });
            if (!existingLead) {
                const lead = new lead_entity_1.Lead();
                lead.carId = insurance.carId;
                lead.insuranceId = insurance.id;
                lead.operatorId = operator.id;
                lead.leadType = leadType;
                lead.daysRemaining = daysLeft;
                lead.status = 'new';
                await this.leadRepo.save(lead);
                await this.createNotification(operator.id, `⚠️ ${leadType} lead: ${insurance.car?.plateNumber}\nSug'urta muddati: ${daysLeft} kun`, 'newLead');
            }
        }
    }
    async createNotification(userId, message, type) {
        const notification = new notification_entity_1.Notification();
        notification.userId = userId;
        notification.message = message;
        notification.type = type;
        notification.isRead = false;
        return this.notifRepo.save(notification);
    }
    async getUserNotifications(userId) {
        return this.notifRepo.find({
            where: { userId, isRead: false },
            order: { sentAt: 'DESC' }
        });
    }
    async markAsRead(id) {
        await this.notifRepo.update(id, { isRead: true });
    }
    async markAllAsRead(userId) {
        await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
    }
    async deleteOldNotifications(days = 30) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        const result = await this.notifRepo.delete({
            sentAt: (0, typeorm_2.LessThan)(date),
            isRead: true
        });
        return result.affected || 0;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(insurance_entity_1.CarInsurance)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationService);
//# sourceMappingURL=notification.service.js.map
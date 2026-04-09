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
var NotificationScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const notification_service_1 = require("./notification.service");
let NotificationScheduler = NotificationScheduler_1 = class NotificationScheduler {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(NotificationScheduler_1.name);
    }
    async handleMorningCheck() {
        this.logger.log('Running morning notification check...');
        await this.notificationService.checkExpiringInsurances();
    }
    async handleAfternoonCheck() {
        this.logger.log('Running afternoon notification check...');
        await this.notificationService.checkExpiringInsurances();
    }
    async handleEveningCheck() {
        this.logger.log('Running evening notification check...');
        await this.notificationService.checkExpiringInsurances();
    }
    async handleCleanup() {
        this.logger.log('Running notification cleanup...');
        const deleted = await this.notificationService.deleteOldNotifications();
        this.logger.log(`Deleted ${deleted} old notifications`);
    }
};
exports.NotificationScheduler = NotificationScheduler;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "handleMorningCheck", null);
__decorate([
    (0, schedule_1.Cron)('0 14 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "handleAfternoonCheck", null);
__decorate([
    (0, schedule_1.Cron)('0 20 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "handleEveningCheck", null);
__decorate([
    (0, schedule_1.Cron)('0 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "handleCleanup", null);
exports.NotificationScheduler = NotificationScheduler = NotificationScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationScheduler);
//# sourceMappingURL=notification.scheduler.js.map
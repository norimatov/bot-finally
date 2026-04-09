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
exports.ModerationController = void 0;
const common_1 = require("@nestjs/common");
const moderation_service_1 = require("./moderation.service");
const admin_guard_1 = require("../bot/guards/admin.guard");
let ModerationController = class ModerationController {
    constructor(moderationService) {
        this.moderationService = moderationService;
    }
    async getStats() {
        try {
            const pending = await this.moderationService.getPendingCount();
            const pendingList = await this.moderationService.getPending();
            let approved = 0;
            let rejected = 0;
            const allModerations = await this.getAllModerationsFromStorage();
            for (const mod of allModerations) {
                if (mod.status === 'approved')
                    approved++;
                if (mod.status === 'rejected')
                    rejected++;
            }
            return {
                success: true,
                data: {
                    total: allModerations.length,
                    pending: pending,
                    approved: approved,
                    rejected: rejected,
                    expired: pendingList.filter(m => m.expiresAt < Date.now()).length
                }
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Statistika olishda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllModerationsFromStorage() {
        const pending = await this.moderationService.getPending();
        const result = [];
        for (const mod of pending) {
            result.push(mod);
        }
        return result;
    }
    async getAll() {
        try {
            const moderations = await this.moderationService.getPending();
            return {
                success: true,
                data: moderations.map(m => ({
                    id: m.id,
                    plateNumber: m.data.plateNumber,
                    ownerName: m.data.ownerName,
                    ownerPhone: m.data.ownerPhone,
                    status: m.status,
                    submittedAt: m.data.submittedAt,
                    expiresAt: m.expiresAt,
                    registrarName: m.data.registrarName,
                    moderatedBy: m.moderatedBy,
                    moderatedAt: m.moderatedAt,
                    rejectionReason: m.rejectionReason
                }))
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Moderatsiyalarni olishda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPending() {
        try {
            const moderations = await this.moderationService.getPending();
            return {
                success: true,
                data: moderations.map(m => ({
                    id: m.id,
                    plateNumber: m.data.plateNumber,
                    ownerName: m.data.ownerName,
                    ownerPhone: m.data.ownerPhone,
                    secondPhone: m.data.secondPhone,
                    insuranceType: m.data.insuranceType,
                    startDate: m.data.startDate,
                    endDate: m.data.endDate,
                    submittedAt: m.data.submittedAt,
                    expiresAt: m.expiresAt,
                    timeLeft: Math.round((m.expiresAt - Date.now()) / (60 * 60 * 1000)),
                    registrarName: m.data.registrarName,
                    hasTechPhoto: !!m.data.techPhoto,
                    hasCarPhoto: !!m.data.carPhoto
                }))
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Kutilayotgan moderatsiyalarni olishda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getApproved() {
        try {
            return {
                success: true,
                data: [],
                message: 'Tasdiqlangan moderatsiyalar ro\'yxati hozircha mavjud emas'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Tasdiqlangan moderatsiyalarni olishda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRejected() {
        try {
            return {
                success: true,
                data: [],
                message: 'Rad etilgan moderatsiyalar ro\'yxati hozircha mavjud emas'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Rad etilgan moderatsiyalarni olishda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getOperatorStats(operatorId) {
        try {
            const stats = await this.moderationService.getOperatorStats(operatorId);
            return {
                success: true,
                data: stats
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Operator statistikasini olishda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRegistrarStats(registrarId) {
        try {
            return {
                success: true,
                data: {
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                    total: 0,
                    message: 'Registrator statistikasi hozircha mavjud emas'
                }
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Registrator statistikasini olishda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getOne(id) {
        try {
            const moderation = await this.moderationService.get(id);
            if (!moderation) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Moderatsiya topilmadi'
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: {
                    id: moderation.id,
                    data: moderation.data,
                    status: moderation.status,
                    notifiedOperators: moderation.notifiedOperators,
                    moderatedBy: moderation.moderatedBy,
                    moderatedAt: moderation.moderatedAt,
                    rejectionReason: moderation.rejectionReason,
                    expiresAt: moderation.expiresAt,
                    timeLeft: Math.round((moderation.expiresAt - Date.now()) / (60 * 60 * 1000))
                }
            };
        }
        catch (error) {
            if (error.status === common_1.HttpStatus.NOT_FOUND)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Moderatsiyani olishda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async approve(id, operatorId) {
        try {
            if (!operatorId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Operator ID si kiritilishi shart'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.moderationService.approve(id, operatorId);
            if (!result.success) {
                throw new common_1.HttpException({
                    success: false,
                    message: result.message
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            return {
                success: true,
                message: result.message,
                data: {
                    carId: result.car?.id,
                    plateNumber: result.car?.plateNumber
                }
            };
        }
        catch (error) {
            if (error.status === common_1.HttpStatus.BAD_REQUEST)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Moderatsiyani tasdiqlashda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async reject(id, operatorId, reason) {
        try {
            if (!operatorId) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Operator ID si kiritilishi shart'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!reason || !reason.message) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Rad etish sababi kiritilishi shart'
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.moderationService.reject(id, operatorId, reason);
            if (!result.success) {
                throw new common_1.HttpException({
                    success: false,
                    message: result.message
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            return {
                success: true,
                message: result.message
            };
        }
        catch (error) {
            if (error.status === common_1.HttpStatus.BAD_REQUEST)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Moderatsiyani rad etishda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPhotos(id) {
        try {
            const moderation = await this.moderationService.get(id);
            if (!moderation) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Moderatsiya topilmadi'
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: {
                    techPhoto: moderation.data.techPhoto,
                    carPhoto: moderation.data.carPhoto
                }
            };
        }
        catch (error) {
            if (error.status === common_1.HttpStatus.NOT_FOUND)
                throw error;
            throw new common_1.HttpException({
                success: false,
                message: 'Rasmlarni olishda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getOperatorModerations(operatorId) {
        try {
            const moderations = await this.moderationService.getOperatorModerations(operatorId);
            return {
                success: true,
                data: moderations.map(m => ({
                    id: m.id,
                    plateNumber: m.data.plateNumber,
                    ownerName: m.data.ownerName,
                    status: m.status,
                    submittedAt: m.data.submittedAt,
                    expiresAt: m.expiresAt,
                    timeLeft: Math.round((m.expiresAt - Date.now()) / (60 * 60 * 1000))
                }))
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Operator moderatsiyalarini olishda xatolik yuz berdi',
                error: error.message
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ModerationController = ModerationController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getPending", null);
__decorate([
    (0, common_1.Get)('approved'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getApproved", null);
__decorate([
    (0, common_1.Get)('rejected'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getRejected", null);
__decorate([
    (0, common_1.Get)('operator/:operatorId/stats'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('operatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getOperatorStats", null);
__decorate([
    (0, common_1.Get)('registrar/:registrarId/stats'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('registrarId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getRegistrarStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('operatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('operatorId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)(':id/photos'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getPhotos", null);
__decorate([
    (0, common_1.Get)('operator/:operatorId/moderations'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('operatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ModerationController.prototype, "getOperatorModerations", null);
exports.ModerationController = ModerationController = __decorate([
    (0, common_1.Controller)('moderation'),
    __metadata("design:paramtypes", [moderation_service_1.ModerationService])
], ModerationController);
//# sourceMappingURL=moderation.controller.js.map
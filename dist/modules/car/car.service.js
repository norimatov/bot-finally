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
exports.CarService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const car_entity_1 = require("../../database/entities/car.entity");
const insurance_entity_1 = require("../../database/entities/insurance.entity");
const date_util_1 = require("../../common/utils/date.util");
let CarService = class CarService {
    constructor(carRepo, insuranceRepo) {
        this.carRepo = carRepo;
        this.insuranceRepo = insuranceRepo;
    }
    async findAll() {
        return this.carRepo.find({
            relations: ['createdBy', 'insurances', 'submittedBy', 'moderatedBy'],
            order: { createdAt: 'DESC' }
        });
    }
    async findOne(id) {
        return this.carRepo.findOne({
            where: { id },
            relations: ['createdBy', 'insurances', 'submittedBy', 'moderatedBy']
        });
    }
    async findByPlate(plateNumber) {
        return this.carRepo.findOne({
            where: { plateNumber },
            relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy']
        });
    }
    async findBySecondPlate(secondPlateNumber) {
        return this.carRepo.findOne({
            where: { secondPlateNumber },
            relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy']
        });
    }
    async findByAnyPlate(plateNumber) {
        return this.carRepo.findOne({
            where: [
                { plateNumber },
                { secondPlateNumber: plateNumber }
            ],
            relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy']
        });
    }
    async findByPhone(phone) {
        const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
        return this.carRepo.find({
            where: [
                { ownerPhone: formattedPhone },
                { secondPhone: formattedPhone }
            ],
            relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy'],
            order: { createdAt: 'DESC' }
        });
    }
    async create(carData) {
        const car = this.carRepo.create(carData);
        return this.carRepo.save(car);
    }
    async update(id, carData) {
        await this.carRepo.update(id, carData);
        return this.findOne(id);
    }
    async updatePhotos(id, photos) {
        await this.carRepo.update(id, photos);
        return this.findOne(id);
    }
    async delete(id) {
        await this.carRepo.delete(id);
    }
    async findByUser(userId) {
        return this.carRepo.find({
            where: { createdById: userId },
            relations: ['insurances', 'submittedBy', 'moderatedBy'],
            order: { createdAt: 'DESC' }
        });
    }
    async findByIds(ids) {
        return this.carRepo.find({
            where: { id: (0, typeorm_2.In)(ids) },
            relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy']
        });
    }
    async getRecentCars(limit = 10) {
        return this.carRepo.find({
            relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy'],
            order: { createdAt: 'DESC' },
            take: limit
        });
    }
    async findAllWithInsurances() {
        return this.carRepo.find({
            relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy'],
            order: { createdAt: 'DESC' }
        });
    }
    async getPendingCars() {
        return this.carRepo.find({
            where: { moderationStatus: 'pending' },
            relations: ['insurances', 'submittedBy'],
            order: { createdAt: 'ASC' }
        });
    }
    async getApprovedCars() {
        return this.carRepo.find({
            where: { moderationStatus: 'approved' },
            relations: ['insurances', 'submittedBy', 'moderatedBy'],
            order: { moderatedAt: 'DESC' }
        });
    }
    async getRejectedCars() {
        return this.carRepo.find({
            where: { moderationStatus: 'rejected' },
            relations: ['insurances', 'submittedBy', 'moderatedBy'],
            order: { moderatedAt: 'DESC' }
        });
    }
    async approveCar(id, moderatorId) {
        await this.carRepo.update(id, {
            moderationStatus: 'approved',
            moderatedById: moderatorId,
            moderatedAt: new Date()
        });
        return this.findOne(id);
    }
    async rejectCar(id, moderatorId, reason) {
        await this.carRepo.update(id, {
            moderationStatus: 'rejected',
            moderatedById: moderatorId,
            moderatedAt: new Date(),
            rejectionReason: reason
        });
        return this.findOne(id);
    }
    async getCarsBySubmitter(registrarId) {
        return this.carRepo.find({
            where: { submittedById: registrarId },
            relations: ['insurances', 'moderatedBy'],
            order: { createdAt: 'DESC' }
        });
    }
    async getCarsModeratedBy(operatorId) {
        return this.carRepo.find({
            where: { moderatedById: operatorId },
            relations: ['insurances', 'submittedBy'],
            order: { moderatedAt: 'DESC' }
        });
    }
    async getModerationStats() {
        const [pending, approved, rejected, total] = await Promise.all([
            this.carRepo.count({ where: { moderationStatus: 'pending' } }),
            this.carRepo.count({ where: { moderationStatus: 'approved' } }),
            this.carRepo.count({ where: { moderationStatus: 'rejected' } }),
            this.carRepo.count()
        ]);
        return {
            pending,
            approved,
            rejected,
            total,
            approvalRate: total > 0 ? Number(((approved / total) * 100).toFixed(1)) : 0,
            rejectionRate: total > 0 ? Number(((rejected / total) * 100).toFixed(1)) : 0
        };
    }
    async cleanOldRejected(days = 30) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        const result = await this.carRepo
            .createQueryBuilder()
            .delete()
            .where('moderationStatus = :status', { status: 'rejected' })
            .andWhere('moderatedAt < :date', { date })
            .execute();
        return result.affected || 0;
    }
    async getExpiringCars(days) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        targetDate.setHours(23, 59, 59, 999);
        const insurances = await this.insuranceRepo.find({
            where: {
                endDate: (0, typeorm_2.Between)(today, targetDate),
                status: 'active'
            },
            relations: ['car'],
            order: { endDate: 'ASC' }
        });
        return insurances
            .map(i => i.car)
            .filter(car => car !== null);
    }
    async getExpiredCars() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const insurances = await this.insuranceRepo.find({
            where: {
                endDate: (0, typeorm_2.LessThan)(today),
                status: 'expired'
            },
            relations: ['car'],
            order: { endDate: 'DESC' }
        });
        return insurances
            .map(i => i.car)
            .filter(car => car !== null);
    }
    async getActiveInsuredCars() {
        const insurances = await this.insuranceRepo.find({
            where: { status: 'active' },
            relations: ['car'],
            order: { endDate: 'ASC' }
        });
        return insurances
            .map(i => i.car)
            .filter(car => car !== null);
    }
    async getCarsWithoutInsurance() {
        const carsWithInsurance = await this.insuranceRepo
            .createQueryBuilder('insurance')
            .select('insurance.carId')
            .where('insurance.status = :status', { status: 'active' })
            .getMany();
        const insuredCarIds = carsWithInsurance.map(i => i.carId);
        if (insuredCarIds.length === 0) {
            return this.carRepo.find({
                relations: ['createdBy', 'submittedBy', 'moderatedBy'],
                order: { createdAt: 'DESC' }
            });
        }
        return this.carRepo
            .createQueryBuilder('car')
            .leftJoinAndSelect('car.createdBy', 'user')
            .leftJoinAndSelect('car.submittedBy', 'submittedBy')
            .leftJoinAndSelect('car.moderatedBy', 'moderatedBy')
            .where('car.id NOT IN (:...ids)', { ids: insuredCarIds })
            .orderBy('car.createdAt', 'DESC')
            .getMany();
    }
    async getExpiringCount(days) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        targetDate.setHours(23, 59, 59, 999);
        return this.insuranceRepo.count({
            where: {
                endDate: (0, typeorm_2.Between)(today, targetDate),
                status: 'active'
            }
        });
    }
    async getExpiredCount() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.insuranceRepo.count({
            where: {
                endDate: (0, typeorm_2.LessThan)(today),
                status: 'expired'
            }
        });
    }
    async getTodayCount() {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.carRepo.count({
            where: { createdAt: (0, typeorm_2.Between)(today, tomorrow) }
        });
    }
    async getMonthCount() {
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const monthEnd = date_util_1.DateUtil.getMonthEnd();
        return this.carRepo.count({
            where: { createdAt: (0, typeorm_2.Between)(monthStart, monthEnd) }
        });
    }
    async getCarStats() {
        const today = date_util_1.DateUtil.getToday();
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const monthEnd = date_util_1.DateUtil.getMonthEnd();
        const [total, todayCount, monthCount, activeCount, expiringCount, expiredCount, withSecondPlate, withPhotos, withGuarantor, withSecondPhone, pendingCount, approvedCount, rejectedCount] = await Promise.all([
            this.carRepo.count(),
            this.carRepo.count({
                where: { createdAt: (0, typeorm_2.Between)(today, new Date()) }
            }),
            this.carRepo.count({
                where: { createdAt: (0, typeorm_2.Between)(monthStart, monthEnd) }
            }),
            this.insuranceRepo.count({
                where: { status: 'active' }
            }),
            this.getExpiringCount(30),
            this.getExpiredCount(),
            this.carRepo.count({
                where: { secondPlateNumber: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) }
            }),
            this.carRepo.count({
                where: [
                    { techPhoto: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                    { carPhoto: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) }
                ]
            }),
            this.carRepo.count({
                where: { guarantorName: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) }
            }),
            this.carRepo.count({
                where: { secondPhone: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) }
            }),
            this.carRepo.count({
                where: { moderationStatus: 'pending' }
            }),
            this.carRepo.count({
                where: { moderationStatus: 'approved' }
            }),
            this.carRepo.count({
                where: { moderationStatus: 'rejected' }
            })
        ]);
        return {
            total,
            today: todayCount,
            month: monthCount,
            active: activeCount,
            expiring: expiringCount,
            expired: expiredCount,
            withSecondPlate,
            withPhotos,
            withGuarantor,
            withSecondPhone,
            moderation: {
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount
            }
        };
    }
    async getUserStats(userId) {
        const [total, today, month, pending, approved, rejected] = await Promise.all([
            this.carRepo.count({ where: { createdById: userId } }),
            this.getUserTodayCount(userId),
            this.getUserMonthCount(userId),
            this.carRepo.count({ where: { createdById: userId, moderationStatus: 'pending' } }),
            this.carRepo.count({ where: { createdById: userId, moderationStatus: 'approved' } }),
            this.carRepo.count({ where: { createdById: userId, moderationStatus: 'rejected' } })
        ]);
        return {
            total,
            today,
            month,
            moderation: {
                pending,
                approved,
                rejected
            }
        };
    }
    async getUserTodayCount(userId) {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.carRepo.count({
            where: {
                createdById: userId,
                createdAt: (0, typeorm_2.Between)(today, tomorrow)
            }
        });
    }
    async getUserMonthCount(userId) {
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const monthEnd = date_util_1.DateUtil.getMonthEnd();
        return this.carRepo.count({
            where: {
                createdById: userId,
                createdAt: (0, typeorm_2.Between)(monthStart, monthEnd)
            }
        });
    }
    async searchCars(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        const searchTerm = `%${query.trim()}%`;
        return this.carRepo
            .createQueryBuilder('car')
            .leftJoinAndSelect('car.insurances', 'insurance')
            .leftJoinAndSelect('car.createdBy', 'user')
            .leftJoinAndSelect('car.submittedBy', 'submittedBy')
            .leftJoinAndSelect('car.moderatedBy', 'moderatedBy')
            .where('car.plateNumber ILIKE :term', { term: searchTerm })
            .orWhere('car.secondPlateNumber ILIKE :term', { term: searchTerm })
            .orWhere('car.ownerPhone ILIKE :term', { term: searchTerm })
            .orWhere('car.secondPhone ILIKE :term', { term: searchTerm })
            .orWhere('car.ownerName ILIKE :term', { term: searchTerm })
            .orWhere('car.guarantorName ILIKE :term', { term: searchTerm })
            .orWhere('car.guarantorPhone ILIKE :term', { term: searchTerm })
            .orderBy('car.createdAt', 'DESC')
            .take(20)
            .getMany();
    }
    async searchByPhone(phone) {
        const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
        return this.carRepo.find({
            where: [
                { ownerPhone: formattedPhone },
                { secondPhone: formattedPhone },
                { guarantorPhone: formattedPhone }
            ],
            relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy'],
            order: { createdAt: 'DESC' }
        });
    }
    async searchByGuarantor(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        const searchTerm = `%${query.trim()}%`;
        return this.carRepo
            .createQueryBuilder('car')
            .leftJoinAndSelect('car.insurances', 'insurance')
            .leftJoinAndSelect('car.createdBy', 'user')
            .leftJoinAndSelect('car.submittedBy', 'submittedBy')
            .leftJoinAndSelect('car.moderatedBy', 'moderatedBy')
            .where('car.guarantorName ILIKE :term', { term: searchTerm })
            .orWhere('car.guarantorPhone ILIKE :term', { term: searchTerm })
            .orderBy('car.createdAt', 'DESC')
            .getMany();
    }
    async searchBySecondPlate(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        const searchTerm = `%${query.trim()}%`;
        return this.carRepo
            .createQueryBuilder('car')
            .leftJoinAndSelect('car.insurances', 'insurance')
            .leftJoinAndSelect('car.createdBy', 'user')
            .leftJoinAndSelect('car.submittedBy', 'submittedBy')
            .leftJoinAndSelect('car.moderatedBy', 'moderatedBy')
            .where('car.secondPlateNumber ILIKE :term', { term: searchTerm })
            .orderBy('car.createdAt', 'DESC')
            .getMany();
    }
    async searchBySecondPhone(phone) {
        if (!phone)
            return [];
        const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
        return this.carRepo.find({
            where: { secondPhone: formattedPhone },
            relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy'],
            order: { createdAt: 'DESC' }
        });
    }
    async searchByModerationStatus(status) {
        return this.carRepo.find({
            where: { moderationStatus: status },
            relations: ['insurances', 'submittedBy', 'moderatedBy'],
            order: { createdAt: 'DESC' }
        });
    }
    async getOperatorCarReport(userId, startDate, endDate) {
        const cars = await this.carRepo.find({
            where: {
                createdById: userId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate)
            },
            relations: ['insurances']
        });
        return {
            total: cars.length,
            withInsurance: cars.filter(c => c.insurances?.some(i => i.status === 'active')).length,
            withoutInsurance: cars.filter(c => !c.insurances?.some(i => i.status === 'active')).length,
            withGuarantor: cars.filter(c => c.guarantorName).length,
            withSecondPlate: cars.filter(c => c.secondPlateNumber).length,
            withSecondPhone: cars.filter(c => c.secondPhone).length,
            withPhotos: cars.filter(c => c.techPhoto && c.carPhoto).length,
            cars: cars.slice(0, 5).map(c => ({
                id: c.id,
                plateNumber: c.plateNumber,
                secondPlateNumber: c.secondPlateNumber,
                ownerName: c.ownerName,
                ownerPhone: c.ownerPhone,
                secondPhone: c.secondPhone,
                guarantorName: c.guarantorName,
                hasPhotos: !!(c.techPhoto && c.carPhoto)
            }))
        };
    }
    async getDailyReport(date = new Date()) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const cars = await this.carRepo.find({
            where: { createdAt: (0, typeorm_2.Between)(startOfDay, endOfDay) },
            relations: ['createdBy', 'submittedBy']
        });
        const byUser = {};
        cars.forEach(car => {
            const userId = car.createdById;
            if (!byUser[userId]) {
                byUser[userId] = {
                    userId,
                    userName: car.createdBy?.firstName || 'Noma\'lum',
                    count: 0,
                    withGuarantor: 0,
                    withSecondPlate: 0,
                    withSecondPhone: 0,
                    withPhotos: 0,
                    cars: []
                };
            }
            byUser[userId].count++;
            if (car.guarantorName)
                byUser[userId].withGuarantor++;
            if (car.secondPlateNumber)
                byUser[userId].withSecondPlate++;
            if (car.secondPhone)
                byUser[userId].withSecondPhone++;
            if (car.techPhoto && car.carPhoto)
                byUser[userId].withPhotos++;
            byUser[userId].cars.push({
                plateNumber: car.plateNumber,
                secondPlateNumber: car.secondPlateNumber,
                ownerName: car.ownerName,
                ownerPhone: car.ownerPhone,
                secondPhone: car.secondPhone,
                guarantorName: car.guarantorName,
                hasPhotos: !!(car.techPhoto && car.carPhoto)
            });
        });
        return {
            date: startOfDay.toLocaleDateString('uz-UZ'),
            total: cars.length,
            withGuarantor: cars.filter(c => c.guarantorName).length,
            withSecondPlate: cars.filter(c => c.secondPlateNumber).length,
            withSecondPhone: cars.filter(c => c.secondPhone).length,
            withPhotos: cars.filter(c => c.techPhoto && c.carPhoto).length,
            byUser: Object.values(byUser)
        };
    }
    async getGuarantorStats() {
        const cars = await this.carRepo.find({
            where: { guarantorName: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
            relations: ['insurances']
        });
        const stats = {
            total: cars.length,
            withActiveInsurance: cars.filter(c => c.insurances?.some(i => i.status === 'active')).length,
            byGuarantor: {}
        };
        cars.forEach(car => {
            const guarantorName = car.guarantorName || 'Noma\'lum';
            if (!stats.byGuarantor[guarantorName]) {
                stats.byGuarantor[guarantorName] = {
                    count: 0,
                    cars: []
                };
            }
            stats.byGuarantor[guarantorName].count++;
            stats.byGuarantor[guarantorName].cars.push({
                plateNumber: car.plateNumber,
                secondPlateNumber: car.secondPlateNumber,
                ownerPhone: car.ownerPhone,
                secondPhone: car.secondPhone
            });
        });
        return stats;
    }
    async getModerationReport(startDate, endDate) {
        const cars = await this.carRepo.find({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate)
            },
            relations: ['submittedBy', 'moderatedBy']
        });
        return {
            period: {
                start: startDate.toLocaleDateString('uz-UZ'),
                end: endDate.toLocaleDateString('uz-UZ')
            },
            total: cars.length,
            pending: cars.filter(c => c.moderationStatus === 'pending').length,
            approved: cars.filter(c => c.moderationStatus === 'approved').length,
            rejected: cars.filter(c => c.moderationStatus === 'rejected').length,
            byRegistrar: this.groupByRegistrar(cars),
            byOperator: this.groupByOperator(cars)
        };
    }
    groupByRegistrar(cars) {
        const result = {};
        cars.forEach(car => {
            if (car.submittedBy) {
                const id = car.submittedById;
                if (!result[id]) {
                    result[id] = {
                        name: car.submittedBy.firstName || car.submittedBy.username,
                        total: 0,
                        approved: 0,
                        rejected: 0,
                        pending: 0
                    };
                }
                result[id].total++;
                result[id][car.moderationStatus]++;
            }
        });
        return result;
    }
    groupByOperator(cars) {
        const result = {};
        cars.forEach(car => {
            if (car.moderatedBy) {
                const id = car.moderatedById;
                if (!result[id]) {
                    result[id] = {
                        name: car.moderatedBy.firstName || car.moderatedBy.username,
                        approved: 0,
                        rejected: 0
                    };
                }
                result[id][car.moderationStatus]++;
            }
        });
        return result;
    }
    async isPlateNumberUnique(plateNumber, excludeId) {
        const query = this.carRepo.createQueryBuilder('car')
            .where('car.plateNumber = :plateNumber', { plateNumber });
        if (excludeId) {
            query.andWhere('car.id != :excludeId', { excludeId });
        }
        const count = await query.getCount();
        return count === 0;
    }
    async isSecondPlateNumberUnique(secondPlateNumber, excludeId) {
        if (!secondPlateNumber)
            return true;
        const query = this.carRepo.createQueryBuilder('car')
            .where('car.secondPlateNumber = :secondPlateNumber', { secondPlateNumber });
        if (excludeId) {
            query.andWhere('car.id != :excludeId', { excludeId });
        }
        const count = await query.getCount();
        return count === 0;
    }
    async isPhoneNumberUnique(phoneNumber, excludeId) {
        const query = this.carRepo.createQueryBuilder('car')
            .where('car.ownerPhone = :phoneNumber', { phoneNumber });
        if (excludeId) {
            query.andWhere('car.id != :excludeId', { excludeId });
        }
        const count = await query.getCount();
        return count === 0;
    }
    async isSecondPhoneUnique(phoneNumber, excludeId) {
        if (!phoneNumber)
            return true;
        const query = this.carRepo.createQueryBuilder('car')
            .where('car.secondPhone = :phoneNumber', { phoneNumber });
        if (excludeId) {
            query.andWhere('car.id != :excludeId', { excludeId });
        }
        const count = await query.getCount();
        return count === 0;
    }
    async isGuarantorPhoneUnique(phoneNumber, excludeId) {
        const query = this.carRepo.createQueryBuilder('car')
            .where('car.guarantorPhone = :phoneNumber', { phoneNumber });
        if (excludeId) {
            query.andWhere('car.id != :excludeId', { excludeId });
        }
        const count = await query.getCount();
        return count === 0;
    }
    async exists(id) {
        const count = await this.carRepo.count({ where: { id } });
        return count > 0;
    }
    async checkCarPhotos(carId) {
        const car = await this.findOne(carId);
        if (!car) {
            console.log('❌ Avtomobil topilmadi');
            return null;
        }
        console.log('🚗 Avtomobil:', car.plateNumber);
        console.log('📸 Tex pasport:', car.techPhoto);
        console.log('📸 Mashina rasmi:', car.carPhoto);
        const result = {
            plateNumber: car.plateNumber,
            techPhoto: car.techPhoto,
            carPhoto: car.carPhoto,
            techPhotoExists: false,
            carPhotoExists: false,
            techFullPath: null,
            carFullPath: null
        };
        const fs = require('fs');
        const path = require('path');
        if (car.techPhoto) {
            const cleanPath = car.techPhoto.startsWith('/')
                ? car.techPhoto.substring(1)
                : car.techPhoto;
            const fullPath = path.join(process.cwd(), cleanPath);
            result.techFullPath = fullPath;
            result.techPhotoExists = fs.existsSync(fullPath);
            console.log('📁 Tex rasm to\'liq yo\'li:', fullPath);
            console.log('📁 Tex rasm mavjudmi?', result.techPhotoExists);
        }
        if (car.carPhoto) {
            const cleanPath = car.carPhoto.startsWith('/')
                ? car.carPhoto.substring(1)
                : car.carPhoto;
            const fullPath = path.join(process.cwd(), cleanPath);
            result.carFullPath = fullPath;
            result.carPhotoExists = fs.existsSync(fullPath);
            console.log('📁 Mashina rasm to\'liq yo\'li:', fullPath);
            console.log('📁 Mashina rasm mavjudmi?', result.carPhotoExists);
        }
        return result;
    }
    async checkAllCarsPhotos(limit = 10) {
        const cars = await this.carRepo.find({
            take: limit,
            order: { createdAt: 'DESC' }
        });
        const results = [];
        for (const car of cars) {
            const result = await this.checkCarPhotos(car.id);
            results.push(result);
        }
        return results;
    }
};
exports.CarService = CarService;
exports.CarService = CarService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(car_entity_1.Car)),
    __param(1, (0, typeorm_1.InjectRepository)(insurance_entity_1.CarInsurance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CarService);
//# sourceMappingURL=car.service.js.map
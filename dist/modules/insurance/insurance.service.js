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
exports.InsuranceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const insurance_entity_1 = require("../../database/entities/insurance.entity");
const car_entity_1 = require("../../database/entities/car.entity");
const date_util_1 = require("../../common/utils/date.util");
let InsuranceService = class InsuranceService {
    constructor(insuranceRepo, carRepo) {
        this.insuranceRepo = insuranceRepo;
        this.carRepo = carRepo;
    }
    async findAll() {
        return this.insuranceRepo.find({
            relations: ['car', 'createdBy'],
            order: { createdAt: 'DESC' }
        });
    }
    async findAllWithDetails() {
        return this.insuranceRepo.find({
            relations: ['car', 'createdBy'],
            order: { createdAt: 'DESC' }
        });
    }
    async findOne(id) {
        return this.insuranceRepo.findOne({
            where: { id },
            relations: ['car', 'createdBy', 'leads']
        });
    }
    async findByCar(carId) {
        return this.insuranceRepo.find({
            where: { carId },
            relations: ['car'],
            order: { createdAt: 'DESC' }
        });
    }
    async findByType(type) {
        return this.insuranceRepo.find({
            where: { type },
            relations: ['car', 'createdBy'],
            order: { createdAt: 'DESC' }
        });
    }
    async getActive() {
        return this.insuranceRepo.find({
            where: { status: 'active' },
            relations: ['car'],
            order: { endDate: 'ASC' }
        });
    }
    async getExpiring(days) {
        const targetDate = date_util_1.DateUtil.getDateRange(days);
        return this.insuranceRepo.find({
            where: {
                endDate: (0, typeorm_2.LessThan)(targetDate),
                status: 'active'
            },
            relations: ['car'],
            order: { endDate: 'ASC' }
        });
    }
    async getExpired() {
        const today = new Date();
        return this.insuranceRepo.find({
            where: {
                endDate: (0, typeorm_2.LessThan)(today),
                status: 'active'
            },
            relations: ['car'],
            order: { endDate: 'DESC' }
        });
    }
    async getRenewed() {
        return this.insuranceRepo.find({
            where: { status: 'renewed' },
            relations: ['car'],
            order: { updatedAt: 'DESC' }
        });
    }
    async getActiveByCar(carId) {
        return this.insuranceRepo.findOne({
            where: {
                carId,
                status: 'active'
            },
            relations: ['car']
        });
    }
    async getStats() {
        const today = new Date();
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const monthEnd = date_util_1.DateUtil.getMonthEnd();
        const next30Days = date_util_1.DateUtil.getDateRange(30);
        const [active, expiring, expired, renewed, monthly, total, byType] = await Promise.all([
            this.insuranceRepo.count({ where: { status: 'active' } }),
            this.insuranceRepo.count({
                where: {
                    endDate: (0, typeorm_2.LessThan)(next30Days),
                    status: 'active'
                }
            }),
            this.insuranceRepo.count({
                where: {
                    endDate: (0, typeorm_2.LessThan)(today),
                    status: 'active'
                }
            }),
            this.insuranceRepo.count({ where: { status: 'renewed' } }),
            this.insuranceRepo.count({
                where: { createdAt: (0, typeorm_2.Between)(monthStart, monthEnd) }
            }),
            this.insuranceRepo.count(),
            this.getStatsByType()
        ]);
        return {
            active,
            expiring,
            expired,
            renewed,
            monthly,
            total,
            byType
        };
    }
    async getStatsByType() {
        const types = ['24days', '6months', '1year', 'custom'];
        const result = {};
        for (const type of types) {
            const count = await this.insuranceRepo.count({
                where: {
                    type,
                    status: 'active'
                }
            });
            result[type] = count;
        }
        const standard = await this.insuranceRepo.count({
            where: {
                insuranceType: 'standard',
                status: 'active'
            }
        });
        return {
            ...result,
            standard
        };
    }
    async updateStatus(id, status) {
        await this.insuranceRepo.update(id, { status });
        return this.findOne(id);
    }
    async getTodayCount() {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.insuranceRepo.count({
            where: { createdAt: (0, typeorm_2.Between)(today, tomorrow) }
        });
    }
    async getMonthCount() {
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const monthEnd = date_util_1.DateUtil.getMonthEnd();
        return this.insuranceRepo.count({
            where: { createdAt: (0, typeorm_2.Between)(monthStart, monthEnd) }
        });
    }
    async create(data) {
        const insurance = this.insuranceRepo.create(data);
        return this.insuranceRepo.save(insurance);
    }
    async update(id, data) {
        await this.insuranceRepo.update(id, data);
        return this.findOne(id);
    }
    async delete(id) {
        await this.insuranceRepo.update(id, { status: 'cancelled' });
    }
    async getCarActiveInsurance(carId) {
        return this.insuranceRepo.findOne({
            where: {
                carId,
                status: 'active'
            },
            relations: ['car']
        });
    }
    async findByDaysLeft(days) {
        const targetDate = date_util_1.DateUtil.getDateRange(days);
        const today = date_util_1.DateUtil.getToday();
        return this.insuranceRepo
            .createQueryBuilder('insurance')
            .leftJoinAndSelect('insurance.car', 'car')
            .where('insurance.endDate BETWEEN :today AND :targetDate', {
            today,
            targetDate
        })
            .andWhere('insurance.status = :status', { status: 'active' })
            .orderBy('insurance.endDate', 'ASC')
            .getMany();
    }
    async cleanOldInsurances(days = 365) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        const result = await this.insuranceRepo
            .createQueryBuilder()
            .update()
            .set({ status: 'expired' })
            .where('endDate < :date', { date })
            .andWhere('status = :status', { status: 'active' })
            .execute();
        return result.affected || 0;
    }
    async getCarsWithInsurance() {
        const cars = await this.carRepo.find({
            relations: ['insurances'],
            order: { createdAt: 'DESC' }
        });
        return cars.map(car => {
            const activeInsurance = car.insurances?.find(i => i.status === 'active');
            return {
                ...car,
                activeInsurance,
                hasActiveInsurance: !!activeInsurance,
                insuranceEndDate: activeInsurance?.endDate,
                daysLeft: activeInsurance ? date_util_1.DateUtil.daysRemaining(activeInsurance.endDate) : 0
            };
        });
    }
    async getExpirationStats() {
        const today = new Date();
        const next7Days = date_util_1.DateUtil.getDateRange(7);
        const next30Days = date_util_1.DateUtil.getDateRange(30);
        const next90Days = date_util_1.DateUtil.getDateRange(90);
        const [expired, expiring7Days, expiring30Days, expiring90Days, active] = await Promise.all([
            this.insuranceRepo.count({
                where: {
                    endDate: (0, typeorm_2.LessThan)(today),
                    status: 'active'
                }
            }),
            this.insuranceRepo.count({
                where: {
                    endDate: (0, typeorm_2.Between)(today, next7Days),
                    status: 'active'
                }
            }),
            this.insuranceRepo.count({
                where: {
                    endDate: (0, typeorm_2.Between)(today, next30Days),
                    status: 'active'
                }
            }),
            this.insuranceRepo.count({
                where: {
                    endDate: (0, typeorm_2.Between)(today, next90Days),
                    status: 'active'
                }
            }),
            this.insuranceRepo.count({ where: { status: 'active' } })
        ]);
        return {
            active,
            expired,
            expiring: {
                '7days': expiring7Days,
                '30days': expiring30Days,
                '90days': expiring90Days
            }
        };
    }
};
exports.InsuranceService = InsuranceService;
exports.InsuranceService = InsuranceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(insurance_entity_1.CarInsurance)),
    __param(1, (0, typeorm_1.InjectRepository)(car_entity_1.Car)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], InsuranceService);
//# sourceMappingURL=insurance.service.js.map
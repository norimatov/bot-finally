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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const insurance_entity_1 = require("../entities/insurance.entity");
const date_util_1 = require("../../common/utils/date.util");
let InsuranceRepository = class InsuranceRepository extends typeorm_1.Repository {
    constructor(dataSource) {
        super(insurance_entity_1.CarInsurance, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async findActive() {
        return this.find({
            where: { status: 'active' },
            relations: ['car']
        });
    }
    async findExpiring(days) {
        const targetDate = date_util_1.DateUtil.getDateRange(days);
        return this.find({
            where: {
                endDate: (0, typeorm_1.LessThan)(targetDate),
                status: 'active'
            },
            relations: ['car']
        });
    }
    async findByCar(carId) {
        return this.find({
            where: { carId: carId },
            order: { createdAt: 'DESC' }
        });
    }
};
exports.InsuranceRepository = InsuranceRepository;
exports.InsuranceRepository = InsuranceRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], InsuranceRepository);
//# sourceMappingURL=insurance.repository.js.map
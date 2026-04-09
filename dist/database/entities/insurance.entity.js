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
exports.CarInsurance = void 0;
const typeorm_1 = require("typeorm");
const car_entity_1 = require("./car.entity");
const user_entity_1 = require("./user.entity");
const lead_entity_1 = require("./lead.entity");
let CarInsurance = class CarInsurance {
};
exports.CarInsurance = CarInsurance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CarInsurance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => car_entity_1.Car),
    (0, typeorm_1.JoinColumn)({ name: 'car_id' }),
    __metadata("design:type", car_entity_1.Car)
], CarInsurance.prototype, "car", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'car_id',
        type: 'int'
    }),
    __metadata("design:type", Number)
], CarInsurance.prototype, "carId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'policy_number',
        nullable: true,
        unique: true,
        type: 'varchar',
        length: 50
    }),
    __metadata("design:type", String)
], CarInsurance.prototype, "policyNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'start_date',
        type: 'date'
    }),
    __metadata("design:type", Date)
], CarInsurance.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'end_date',
        type: 'date'
    }),
    __metadata("design:type", Date)
], CarInsurance.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'enum',
        enum: ['24days', '6months', '1year', 'custom'],
        default: 'custom',
        enumName: 'insurance_type_enum'
    }),
    __metadata("design:type", String)
], CarInsurance.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'insurance_type',
        default: 'standard',
        type: 'varchar',
        length: 50
    }),
    __metadata("design:type", String)
], CarInsurance.prototype, "insuranceType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true
    }),
    __metadata("design:type", Number)
], CarInsurance.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: ['active', 'expired', 'cancelled', 'renewed'],
        default: 'active',
        enumName: 'insurance_status_enum'
    }),
    __metadata("design:type", String)
], CarInsurance.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], CarInsurance.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_by_id',
        type: 'int'
    }),
    __metadata("design:type", Number)
], CarInsurance.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], CarInsurance.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], CarInsurance.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lead_entity_1.Lead, lead => lead.insurance),
    __metadata("design:type", Array)
], CarInsurance.prototype, "leads", void 0);
exports.CarInsurance = CarInsurance = __decorate([
    (0, typeorm_1.Entity)('insurances')
], CarInsurance);
//# sourceMappingURL=insurance.entity.js.map
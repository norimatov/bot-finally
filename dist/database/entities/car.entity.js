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
exports.Car = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const insurance_entity_1 = require("./insurance.entity");
const lead_entity_1 = require("./lead.entity");
let Car = class Car {
};
exports.Car = Car;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Car.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'plate_number',
        unique: true,
        type: 'varchar',
        length: 20
    }),
    __metadata("design:type", String)
], Car.prototype, "plateNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'second_plate_number',
        type: 'varchar',
        length: 20,
        nullable: true
    }),
    __metadata("design:type", String)
], Car.prototype, "secondPlateNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'owner_name',
        nullable: true,
        type: 'varchar',
        length: 100
    }),
    __metadata("design:type", String)
], Car.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'owner_phone',
        type: 'varchar',
        length: 20
    }),
    __metadata("design:type", String)
], Car.prototype, "ownerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'second_phone',
        type: 'varchar',
        length: 20,
        nullable: true
    }),
    __metadata("design:type", String)
], Car.prototype, "secondPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tech_photo',
        type: 'text',
        nullable: true
    }),
    __metadata("design:type", String)
], Car.prototype, "techPhoto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tech_back_photo',
        type: 'text',
        nullable: true
    }),
    __metadata("design:type", String)
], Car.prototype, "techBackPhoto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'car_photo',
        type: 'text',
        nullable: true
    }),
    __metadata("design:type", String)
], Car.prototype, "carPhoto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'guarantor_name',
        type: 'varchar',
        length: 100,
        nullable: true
    }),
    __metadata("design:type", String)
], Car.prototype, "guarantorName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'guarantor_phone',
        type: 'varchar',
        length: 20,
        nullable: true
    }),
    __metadata("design:type", String)
], Car.prototype, "guarantorPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'varchar',
        length: 50
    }),
    __metadata("design:type", String)
], Car.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'varchar',
        length: 50
    }),
    __metadata("design:type", String)
], Car.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'int'
    }),
    __metadata("design:type", Number)
], Car.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'moderation_status',
        type: 'enum',
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }),
    __metadata("design:type", String)
], Car.prototype, "moderationStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'moderated_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Car.prototype, "moderatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'moderated_by_id',
        type: 'int',
        nullable: true
    }),
    __metadata("design:type", Number)
], Car.prototype, "moderatedById", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'moderated_at',
        type: 'timestamp',
        nullable: true
    }),
    __metadata("design:type", Date)
], Car.prototype, "moderatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'rejection_reason',
        type: 'text',
        nullable: true
    }),
    __metadata("design:type", String)
], Car.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'submitted_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Car.prototype, "submittedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'submitted_by_id',
        type: 'int',
        nullable: true
    }),
    __metadata("design:type", Number)
], Car.prototype, "submittedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Car.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_by_id',
        type: 'int'
    }),
    __metadata("design:type", Number)
], Car.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Car.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Car.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => insurance_entity_1.CarInsurance, insurance => insurance.car),
    __metadata("design:type", Array)
], Car.prototype, "insurances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lead_entity_1.Lead, lead => lead.car),
    __metadata("design:type", Array)
], Car.prototype, "leads", void 0);
exports.Car = Car = __decorate([
    (0, typeorm_1.Entity)('cars')
], Car);
//# sourceMappingURL=car.entity.js.map
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
exports.Moderation = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const car_entity_1 = require("./car.entity");
let Moderation = class Moderation {
};
exports.Moderation = Moderation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Moderation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => car_entity_1.Car, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'car_id' }),
    __metadata("design:type", car_entity_1.Car)
], Moderation.prototype, "car", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'car_id',
        type: 'int',
        nullable: true
    }),
    __metadata("design:type", Number)
], Moderation.prototype, "carId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'plate_number',
        type: 'varchar',
        length: 20
    }),
    __metadata("design:type", String)
], Moderation.prototype, "plateNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'owner_name',
        type: 'varchar',
        length: 100
    }),
    __metadata("design:type", String)
], Moderation.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'owner_phone',
        type: 'varchar',
        length: 20
    }),
    __metadata("design:type", String)
], Moderation.prototype, "ownerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'second_phone',
        type: 'varchar',
        length: 20,
        nullable: true
    }),
    __metadata("design:type", String)
], Moderation.prototype, "secondPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tech_photo',
        type: 'text'
    }),
    __metadata("design:type", String)
], Moderation.prototype, "techPhoto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tech_back_photo',
        type: 'text',
        nullable: true
    }),
    __metadata("design:type", String)
], Moderation.prototype, "techBackPhoto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'car_photo',
        type: 'text'
    }),
    __metadata("design:type", String)
], Moderation.prototype, "carPhoto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'insurance_type',
        type: 'varchar',
        length: 20
    }),
    __metadata("design:type", String)
], Moderation.prototype, "insuranceType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'start_date',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Moderation.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'end_date',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Moderation.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'varchar',
        length: 20,
        default: 'pending'
    }),
    __metadata("design:type", String)
], Moderation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'submitted_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Moderation.prototype, "submittedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'submitted_by_id',
        type: 'int'
    }),
    __metadata("design:type", Number)
], Moderation.prototype, "submittedById", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'registrar_telegram_id',
        type: 'varchar',
        length: 50,
        nullable: true
    }),
    __metadata("design:type", String)
], Moderation.prototype, "registrarTelegramId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'registrar_name',
        type: 'varchar',
        length: 100,
        nullable: true
    }),
    __metadata("design:type", String)
], Moderation.prototype, "registrarName", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'moderated_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Moderation.prototype, "moderatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'moderated_by_id',
        type: 'int',
        nullable: true
    }),
    __metadata("design:type", Number)
], Moderation.prototype, "moderatedById", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'moderated_at',
        type: 'timestamp',
        nullable: true
    }),
    __metadata("design:type", Date)
], Moderation.prototype, "moderatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'rejection_reason',
        type: 'text',
        nullable: true
    }),
    __metadata("design:type", String)
], Moderation.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'rejection_field',
        type: 'varchar',
        length: 50,
        nullable: true
    }),
    __metadata("design:type", String)
], Moderation.prototype, "rejectionField", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'expires_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Moderation.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'notified_operators',
        type: 'simple-array',
        nullable: true
    }),
    __metadata("design:type", Array)
], Moderation.prototype, "notifiedOperators", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'additional_data',
        type: 'json',
        nullable: true
    }),
    __metadata("design:type", Object)
], Moderation.prototype, "additionalData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Moderation.prototype, "createdAt", void 0);
exports.Moderation = Moderation = __decorate([
    (0, typeorm_1.Entity)('moderations')
], Moderation);
//# sourceMappingURL=moderation.entity.js.map
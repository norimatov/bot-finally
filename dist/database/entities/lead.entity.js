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
exports.Lead = void 0;
const typeorm_1 = require("typeorm");
const car_entity_1 = require("./car.entity");
const insurance_entity_1 = require("./insurance.entity");
const user_entity_1 = require("./user.entity");
let Lead = class Lead {
};
exports.Lead = Lead;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Lead.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => car_entity_1.Car),
    (0, typeorm_1.JoinColumn)({ name: 'car_id' }),
    __metadata("design:type", car_entity_1.Car)
], Lead.prototype, "car", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'car_id',
        type: 'int'
    }),
    __metadata("design:type", Number)
], Lead.prototype, "carId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => insurance_entity_1.CarInsurance),
    (0, typeorm_1.JoinColumn)({ name: 'insurance_id' }),
    __metadata("design:type", insurance_entity_1.CarInsurance)
], Lead.prototype, "insurance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'insurance_id',
        type: 'int'
    }),
    __metadata("design:type", Number)
], Lead.prototype, "insuranceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'operator_id' }),
    __metadata("design:type", user_entity_1.User)
], Lead.prototype, "operator", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'operator_id',
        nullable: true,
        type: 'int'
    }),
    __metadata("design:type", Number)
], Lead.prototype, "operatorId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'lead_type',
        type: 'enum',
        enum: ['HOT', 'WARM', 'COLD'],
        enumName: 'lead_type_enum'
    }),
    __metadata("design:type", String)
], Lead.prototype, "leadType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'varchar',
        length: 10,
        nullable: true
    }),
    __metadata("design:type", String)
], Lead.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: ['new', 'inProgress', 'closed', 'postponed', 'rejected'],
        default: 'new',
        enumName: 'lead_status_enum'
    }),
    __metadata("design:type", String)
], Lead.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'days_remaining',
        nullable: true,
        type: 'int'
    }),
    __metadata("design:type", Number)
], Lead.prototype, "daysRemaining", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'last_call_at',
        nullable: true,
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Lead.prototype, "lastCallAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'call_count',
        default: 0,
        type: 'int'
    }),
    __metadata("design:type", Number)
], Lead.prototype, "callCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'call_duration',
        nullable: true,
        type: 'int'
    }),
    __metadata("design:type", Number)
], Lead.prototype, "callDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'call_result',
        nullable: true,
        type: 'varchar',
        length: 50
    }),
    __metadata("design:type", String)
], Lead.prototype, "callResult", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'remind_at',
        nullable: true,
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Lead.prototype, "remindAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'remind_note',
        nullable: true,
        type: 'text'
    }),
    __metadata("design:type", String)
], Lead.prototype, "remindNote", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'reminded',
        default: false,
        type: 'boolean'
    }),
    __metadata("design:type", Boolean)
], Lead.prototype, "reminded", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'customer_comment',
        nullable: true,
        type: 'text'
    }),
    __metadata("design:type", String)
], Lead.prototype, "customerComment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'next_action',
        nullable: true,
        type: 'varchar',
        length: 100
    }),
    __metadata("design:type", String)
], Lead.prototype, "nextAction", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'next_action_date',
        nullable: true,
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Lead.prototype, "nextActionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'response_time',
        nullable: true,
        type: 'int'
    }),
    __metadata("design:type", Number)
], Lead.prototype, "responseTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'follow_up_count',
        default: 0,
        type: 'int'
    }),
    __metadata("design:type", Number)
], Lead.prototype, "followUpCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'last_follow_up',
        nullable: true,
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Lead.prototype, "lastFollowUp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true
    }),
    __metadata("design:type", String)
], Lead.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'closed_at',
        nullable: true,
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Lead.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Lead.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Lead.prototype, "updatedAt", void 0);
exports.Lead = Lead = __decorate([
    (0, typeorm_1.Entity)('leads')
], Lead);
//# sourceMappingURL=lead.entity.js.map
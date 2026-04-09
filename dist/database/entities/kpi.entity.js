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
exports.Kpi = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let Kpi = class Kpi {
};
exports.Kpi = Kpi;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Kpi.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Kpi.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_id',
        type: 'int'
    }),
    __metadata("design:type", Number)
], Kpi.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'action_type',
        type: 'varchar',
        length: 50
    }),
    __metadata("design:type", String)
], Kpi.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        default: 0,
        type: 'int'
    }),
    __metadata("design:type", Number)
], Kpi.prototype, "points", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0
    }),
    __metadata("design:type", Number)
], Kpi.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'reference_id',
        nullable: true,
        type: 'int'
    }),
    __metadata("design:type", Number)
], Kpi.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'reference_type',
        nullable: true,
        type: 'varchar',
        length: 50
    }),
    __metadata("design:type", String)
], Kpi.prototype, "referenceType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], Kpi.prototype, "createdAt", void 0);
exports.Kpi = Kpi = __decorate([
    (0, typeorm_1.Entity)('kpis')
], Kpi);
//# sourceMappingURL=kpi.entity.js.map
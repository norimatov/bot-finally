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
exports.DailyStat = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let DailyStat = class DailyStat {
};
exports.DailyStat = DailyStat;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DailyStat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], DailyStat.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_id',
        type: 'int'
    }),
    __metadata("design:type", Number)
], DailyStat.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date'
    }),
    __metadata("design:type", Date)
], DailyStat.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'cars_added',
        default: 0,
        type: 'int'
    }),
    __metadata("design:type", Number)
], DailyStat.prototype, "carsAdded", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'leads_closed',
        default: 0,
        type: 'int'
    }),
    __metadata("design:type", Number)
], DailyStat.prototype, "leadsClosed", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_earned',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0
    }),
    __metadata("design:type", Number)
], DailyStat.prototype, "totalEarned", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], DailyStat.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], DailyStat.prototype, "updatedAt", void 0);
exports.DailyStat = DailyStat = __decorate([
    (0, typeorm_1.Entity)('daily_stats')
], DailyStat);
//# sourceMappingURL=daily-stat.entity.js.map
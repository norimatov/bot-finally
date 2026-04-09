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
exports.BotSession = void 0;
const typeorm_1 = require("typeorm");
let BotSession = class BotSession {
};
exports.BotSession = BotSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BotSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'telegram_id',
        unique: true,
        type: 'bigint'
    }),
    __metadata("design:type", BigInt)
], BotSession.prototype, "telegramId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'session_data',
        type: 'jsonb',
        nullable: true
    }),
    __metadata("design:type", Object)
], BotSession.prototype, "sessionData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'current_scene',
        nullable: true,
        type: 'varchar',
        length: 100
    }),
    __metadata("design:type", String)
], BotSession.prototype, "currentScene", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'temp_data',
        type: 'jsonb',
        nullable: true
    }),
    __metadata("design:type", Object)
], BotSession.prototype, "tempData", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp'
    }),
    __metadata("design:type", Date)
], BotSession.prototype, "updatedAt", void 0);
exports.BotSession = BotSession = __decorate([
    (0, typeorm_1.Entity)('bot_sessions')
], BotSession);
//# sourceMappingURL=bot-session.entity.js.map
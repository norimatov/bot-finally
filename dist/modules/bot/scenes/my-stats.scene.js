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
exports.MyStatsScene = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../../database/entities/user.entity");
const kpi_entity_1 = require("../../../database/entities/kpi.entity");
const date_util_1 = require("../../../common/utils/date.util");
const bot_constants_1 = require("../../../common/constants/bot.constants");
let MyStatsScene = class MyStatsScene {
    constructor(userRepo, kpiRepo) {
        this.userRepo = userRepo;
        this.kpiRepo = kpiRepo;
    }
    async onEnter(ctx) {
        try {
            const telegramId = ctx.from?.id;
            if (!telegramId) {
                await ctx.reply('❌ Foydalanuvchi topilmadi!');
                await this.leaveScene(ctx);
                return;
            }
            const user = await this.userRepo.findOne({
                where: { telegramId: String(telegramId) }
            });
            if (!user) {
                await ctx.reply('❌ Foydalanuvchi topilmadi!');
                await this.leaveScene(ctx);
                return;
            }
            const today = date_util_1.DateUtil.getToday();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const todayKpis = await this.kpiRepo.find({
                where: {
                    userId: user.id,
                    createdAt: (0, typeorm_2.Between)(today, tomorrow)
                }
            });
            const monthStart = date_util_1.DateUtil.getMonthStart();
            const monthKpis = await this.kpiRepo.find({
                where: {
                    userId: user.id,
                    createdAt: (0, typeorm_2.Between)(monthStart, new Date())
                }
            });
            const todayCount = todayKpis.length;
            const todayAmount = todayKpis.reduce((sum, k) => sum + Number(k.amount), 0);
            const monthCount = monthKpis.length;
            const monthAmount = monthKpis.reduce((sum, k) => sum + Number(k.amount), 0);
            const roleEmoji = user.role === 'admin' ? '👑' : user.role === 'operator' ? '🎮' : '📋';
            await ctx.reply(`🏠 <b>MENING NATIJAM</b>\n\n` +
                `${roleEmoji} <b>${user.firstName || user.username}</b>\n` +
                `━━━━━━━━━━━━━━━━━━━\n\n` +
                `📅 <b>BUGUN:</b>\n` +
                `  • Qo'shilgan: ${todayCount} ta\n` +
                `  • Daromad: <b>${todayAmount.toLocaleString()} so'm</b>\n\n` +
                `📆 <b>BU OY:</b>\n` +
                `  • Qo'shilgan: ${monthCount} ta\n` +
                `  • Daromad: <b>${monthAmount.toLocaleString()} so'm</b>`, { parse_mode: 'HTML' });
        }
        catch (error) {
            await ctx.reply('❌ Xatolik yuz berdi!');
        }
        finally {
            await this.leaveScene(ctx);
        }
    }
    async leaveScene(ctx) {
        try {
            if (ctx.scene && typeof ctx.scene.leave === 'function') {
                await ctx.scene.leave();
            }
        }
        catch (error) {
            console.error('Scene leave error:', error);
        }
    }
};
exports.MyStatsScene = MyStatsScene;
__decorate([
    (0, nestjs_telegraf_1.SceneEnter)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MyStatsScene.prototype, "onEnter", null);
exports.MyStatsScene = MyStatsScene = __decorate([
    (0, nestjs_telegraf_1.Scene)(bot_constants_1.SCENES.myStats),
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(kpi_entity_1.Kpi)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MyStatsScene);
//# sourceMappingURL=my-stats.scene.js.map
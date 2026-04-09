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
exports.RulesScene = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const bot_constants_1 = require("../../../common/constants/bot.constants");
let RulesScene = class RulesScene {
    async onEnter(ctx) {
        await ctx.reply('📋 <b>QOIDALAR</b>\n\n' +
            '<b>1️⃣ AVTOMOBIL QO\'SHISH:</b>\n' +
            '• Raqam: <code>01A123BB</code>\n' +
            '• Telefon: <code>998901234567</code>\n' +
            '• Sana: Kalendardan tanlanadi\n\n' +
            '<b>2️⃣ KPI TIZIMI:</b>\n' +
            '• 1 ta avtomobil = 2500 so\'m\n' +
            '• 1 ta HOT lead = 7000 so\'m\n' +
            '• 1 ta WARM lead = 5000 so\'m\n' +
            '• 1 ta COLD lead = 3000 so\'m\n\n' +
            '<b>3️⃣ BONUSLAR:</b>\n' +
            '• 1-o\'rin: 100000 so\'m\n' +
            '• 2-o\'rin: 50000 so\'m\n' +
            '• 3-o\'rin: 25000 so\'m', { parse_mode: 'HTML' });
        await this.leaveScene(ctx);
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
exports.RulesScene = RulesScene;
__decorate([
    (0, nestjs_telegraf_1.SceneEnter)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RulesScene.prototype, "onEnter", null);
exports.RulesScene = RulesScene = __decorate([
    (0, nestjs_telegraf_1.Scene)(bot_constants_1.SCENES.rules),
    (0, common_1.Injectable)()
], RulesScene);
//# sourceMappingURL=rules.scene.js.map
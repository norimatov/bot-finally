"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotUpdate = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const bot_service_1 = require("./bot.service");
const main_keyboard_1 = require("./keyboards/main.keyboard");
const admin_keyboard_1 = require("./keyboards/admin.keyboard");
const operator_keyboard_1 = require("./keyboards/operator.keyboard");
const registrar_guard_1 = require("./guards/registrar.guard");
const admin_guard_1 = require("./guards/admin.guard");
const operator_guard_1 = require("./guards/operator.guard");
const bot_constants_1 = require("../../common/constants/bot.constants");
const lead_service_1 = require("../lead/lead.service");
const user_service_1 = require("../user/user.service");
const car_service_1 = require("../car/car.service");
const kpi_service_1 = require("../kpi/kpi.service");
const insurance_service_1 = require("../insurance/insurance.service");
const moderation_service_1 = require("../moderation/moderation.service");
const exel_service_1 = require("../../shared/exel/exel.service");
const telegraf_1 = require("telegraf");
const date_util_1 = require("../../common/utils/date.util");
const phone_util_1 = require("../../common/utils/phone.util");
const fs = __importStar(require("fs"));
const config_1 = require("@nestjs/config");
let BotUpdate = class BotUpdate {
    constructor(botService, mainKeyboard, adminKeyboard, operatorKeyboard, leadService, userService, carService, kpiService, insuranceService, moderationService, excelService, configService) {
        this.botService = botService;
        this.mainKeyboard = mainKeyboard;
        this.adminKeyboard = adminKeyboard;
        this.operatorKeyboard = operatorKeyboard;
        this.leadService = leadService;
        this.userService = userService;
        this.carService = carService;
        this.kpiService = kpiService;
        this.insuranceService = insuranceService;
        this.moderationService = moderationService;
        this.excelService = excelService;
        this.configService = configService;
    }
    async onStart(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            ctx.session = {
                currentMenu: 'main',
                waitingFor: null,
                moderationFilter: null
            };
            let welcomeMessage = `👋 Xush kelibsiz, ${ctx.from.first_name}!\n\n`;
            if (user.role === 'admin') {
                welcomeMessage += '👑 Siz admin sifatida tizimga kirdingiz.\nBarcha maʼlumotlarni boshqarishingiz mumkin.';
            }
            else if (user.role === 'operator') {
                welcomeMessage += '🎮 Siz operator sifatida tizimga kirdingiz.\nLeadlar va moderatsiya bilan ishlashingiz mumkin.';
            }
            else {
                welcomeMessage += '📋 Siz registrar sifatida tizimga kirdingiz.\nAvtomobil qoʻshishingiz mumkin.';
            }
            await ctx.replyWithHTML(welcomeMessage, this.mainKeyboard.getMainKeyboard(user.role));
        }
        catch (error) {
            console.error('Start xatosi:', error);
            await ctx.reply('❌ Xatolik yuz berdi. Iltimos qaytadan urinib koʻring.');
        }
    }
    async onRules(ctx) {
        try {
            await ctx.replyWithHTML(this.botService.getRules());
        }
        catch (error) {
            console.error('Rules xatosi:', error);
            await ctx.reply('❌ Qoidalarni koʻrishda xatolik yuz berdi.');
        }
    }
    async onHelp(ctx) {
        try {
            await ctx.replyWithHTML('📞 <b>YORDAM</b>\n\n' +
                '❓ Savol yoki muammo boʻlsa, administratorga murojaat qiling:\n' +
                '👤 Admin: @service_admin\n' +
                '⏰ Ish vaqti: 09:00 - 18:00');
        }
        catch (error) {
            console.error('Help xatosi:', error);
            await ctx.reply('❌ Yordamni koʻrishda xatolik yuz berdi.');
        }
    }
    async onAddCar(ctx) {
        try {
            console.log('🚗 Avtomobil qoʻshish bosildi');
            if (!ctx.scene) {
                await ctx.reply('❌ Scene tizimi ishlamayapti. Administratorga murojaat qiling.');
                return;
            }
            await ctx.scene.enter(bot_constants_1.SCENES.addCar);
        }
        catch (error) {
            console.error('AddCar xatosi:', error);
            await ctx.reply('❌ Avtomobil qoʻshishda xatolik yuz berdi.');
        }
    }
    async onMyStats(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const todayStats = await this.kpiService.getTodayStats(user.id);
            const monthStats = await this.kpiService.getMonthStats(user.id);
            await ctx.replyWithHTML(`🏠 <b>MENING NATIJAM</b>\n\n` +
                `📅 <b>BUGUN:</b> ${todayStats.count} ta | ${todayStats.total.toLocaleString()} soʻm\n` +
                `📆 <b>BU OY:</b> ${monthStats.count} ta | ${monthStats.total.toLocaleString()} soʻm`);
        }
        catch (error) {
            console.error('MyStats xatosi:', error);
            await ctx.reply('❌ Statistikani koʻrishda xatolik yuz berdi.');
        }
    }
    async onModeration(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const pendingCount = await this.moderationService.getPendingCount();
            const myModerations = await this.moderationService.getOperatorModerations(user.id);
            ctx.session.currentMenu = 'moderation';
            await ctx.replyWithHTML(`🔄 <b>MODERATSIYA PANELI</b>\n\n` +
                `⏳ Kutilayotgan: ${pendingCount} ta\n` +
                `📋 Sizga yuborilgan: ${myModerations.length} ta\n\n` +
                `Quyidagi boʻlimlardan birini tanlang:`, this.operatorKeyboard.getModerationKeyboard());
        }
        catch (error) {
            console.error('Moderation xatosi:', error);
            await ctx.reply('❌ Moderatsiya panelini ochishda xatolik yuz berdi.');
        }
    }
    async onPendingModerations(ctx) {
        try {
            const pending = await this.moderationService.getPending();
            if (pending.length === 0) {
                await ctx.reply('✅ Kutilayotgan moderatsiyalar mavjud emas.');
                return;
            }
            let message = `⏳ <b>KUTILAYOTGAN MODERATSIYALAR</b> (${pending.length} ta)\n\n`;
            pending.slice(0, 5).forEach((mod, index) => {
                const data = mod.data;
                const timeLeft = Math.round((mod.expiresAt - Date.now()) / (60 * 60 * 1000));
                message += `${index + 1}. 🚗 <b>${data.plateNumber}</b>\n`;
                message += `   👤 Ega: ${data.ownerName}\n`;
                message += `   📞 Tel: ${phone_util_1.PhoneUtil.display(data.ownerPhone)}\n`;
                message += `   ⏳ ${timeLeft > 0 ? timeLeft + ' soat qoldi' : '❌ Muddati o\'tgan'}\n`;
                message += `   📅 Yuborilgan: ${new Date(data.submittedAt).toLocaleString('uz-UZ')}\n\n`;
            });
            await ctx.replyWithHTML(message);
            for (const mod of pending.slice(0, 5)) {
                await this.sendModerationMessage(ctx, mod);
            }
        }
        catch (error) {
            console.error('PendingModerations xatosi:', error);
            await ctx.reply('❌ Kutilayotganlarni koʻrishda xatolik yuz berdi.');
        }
    }
    async onMyModerations(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const myModerations = await this.moderationService.getOperatorModerations(user.id);
            if (myModerations.length === 0) {
                await ctx.reply('📋 Sizga hali moderatsiya yuborilmagan.');
                return;
            }
            let message = `📋 <b>SIZGA YUBORILGAN MODERATSIYALAR</b> (${myModerations.length} ta)\n\n`;
            myModerations.slice(0, 5).forEach((mod, index) => {
                const data = mod.data;
                const statusIcon = mod.status === 'pending' ? '⏳' : mod.status === 'approved' ? '✅' : '❌';
                message += `${index + 1}. ${statusIcon} <b>${data.plateNumber}</b>\n`;
                message += `   👤 Ega: ${data.ownerName}\n`;
                message += `   📞 Tel: ${phone_util_1.PhoneUtil.display(data.ownerPhone)}\n`;
                message += `   📅 Sana: ${new Date(data.submittedAt).toLocaleString('uz-UZ')}\n`;
                message += `   📊 Holat: ${mod.status === 'pending' ? 'Kutilmoqda' : mod.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}\n\n`;
            });
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('MyModerations xatosi:', error);
            await ctx.reply('❌ Moderatsiyalarni koʻrishda xatolik yuz berdi.');
        }
    }
    async onModerationStats(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const stats = await this.moderationService.getOperatorStats(user.id);
            await ctx.replyWithHTML(`📊 <b>MODERATSIYA STATISTIKASI</b>\n\n` +
                `📅 <b>BUGUN:</b>\n` +
                `   • Tasdiqlangan: ${stats.today.approved} ta\n` +
                `   • Rad etilgan: ${stats.today.rejected} ta\n\n` +
                `📆 <b>BU OY:</b>\n` +
                `   • Tasdiqlangan: ${stats.month.approved} ta\n` +
                `   • Rad etilgan: ${stats.month.rejected} ta\n\n` +
                `📊 <b>JAMI:</b>\n` +
                `   • Tasdiqlangan: ${stats.total.approved} ta\n` +
                `   • Rad etilgan: ${stats.total.rejected} ta\n` +
                `   • O'rtacha vaqt: ${stats.avgTime} soat`);
        }
        catch (error) {
            console.error('ModerationStats xatosi:', error);
            await ctx.reply('❌ Statistikani koʻrishda xatolik yuz berdi.');
        }
    }
    async onLeads(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            ctx.session.currentMenu = 'operator_leads';
            const hotCount = await this.leadService.getHotLeadsCount(user.id);
            const warmCount = await this.leadService.getWarmLeadsCount(user.id);
            const coldCount = await this.leadService.getColdLeadsCount(user.id);
            await ctx.replyWithHTML(`📋 <b>LEADLAR PANELI</b>\n\n` +
                `🔥 HOT: ${hotCount} ta\n` +
                `🌤 WARM: ${warmCount} ta\n` +
                `❄️ COLD: ${coldCount} ta\n\n` +
                `Quyidagi boʻlimlardan birini tanlang:`, this.operatorKeyboard.getLeadsMenuKeyboard());
        }
        catch (error) {
            console.error('Leads xatosi:', error);
            await ctx.reply('❌ Leadlarni koʻrishda xatolik yuz berdi.');
        }
    }
    async onHotLeads(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const hotLeads = await this.leadService.getHotLeads(user.id);
            if (hotLeads.length === 0) {
                await ctx.reply('🔥 HOT leadlar mavjud emas.');
                return;
            }
            let message = '🔥 <b>HOT LEADLAR</b> (10 kundan kam)\n\n';
            for (const lead of hotLeads) {
                message += `🚗 <b>${lead.car?.plateNumber || 'Nomaʼlum'}</b>\n`;
                message += `👤 ${lead.car?.ownerName || 'Nomaʼlum'}\n`;
                message += `📞 ${phone_util_1.PhoneUtil.display(lead.car?.ownerPhone) || 'Nomaʼlum'}\n`;
                message += `⏳ ${lead.daysRemaining} kun qoldi\n─────────────────\n\n`;
            }
            await ctx.replyWithHTML(message);
            for (const lead of hotLeads.slice(0, 5)) {
                await ctx.reply(`🚗 ${lead.car?.plateNumber} uchun amal:`, this.operatorKeyboard.getLeadStatusKeyboard(lead.id));
            }
        }
        catch (error) {
            console.error('HotLeads xatosi:', error);
            await ctx.reply('❌ Hot leadlarni koʻrishda xatolik yuz berdi.');
        }
    }
    async onWarmLeads(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const warmLeads = await this.leadService.getWarmLeads(user.id);
            if (warmLeads.length === 0) {
                await ctx.reply('🌤 WARM leadlar mavjud emas.');
                return;
            }
            let message = '🌤 <b>WARM LEADLAR</b> (11-30 kun)\n\n';
            for (const lead of warmLeads) {
                message += `🚗 <b>${lead.car?.plateNumber || 'Nomaʼlum'}</b>\n`;
                message += `👤 ${lead.car?.ownerName || 'Nomaʼlum'}\n`;
                message += `📞 ${phone_util_1.PhoneUtil.display(lead.car?.ownerPhone) || 'Nomaʼlum'}\n`;
                message += `⏳ ${lead.daysRemaining} kun qoldi\n─────────────────\n\n`;
            }
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('WarmLeads xatosi:', error);
            await ctx.reply('❌ Warm leadlarni koʻrishda xatolik yuz berdi.');
        }
    }
    async onColdLeads(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const coldLeads = await this.leadService.getColdLeads(user.id);
            if (coldLeads.length === 0) {
                await ctx.reply('❄️ COLD leadlar mavjud emas.');
                return;
            }
            let message = '❄️ <b>COLD LEADLAR</b> (30+ kun)\n\n';
            for (const lead of coldLeads) {
                message += `🚗 <b>${lead.car?.plateNumber || 'Nomaʼlum'}</b>\n`;
                message += `👤 ${lead.car?.ownerName || 'Nomaʼlum'}\n`;
                message += `📞 ${phone_util_1.PhoneUtil.display(lead.car?.ownerPhone) || 'Nomaʼlum'}\n`;
                message += `⏳ ${lead.daysRemaining} kun qoldi\n─────────────────\n\n`;
            }
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('ColdLeads xatosi:', error);
            await ctx.reply('❌ Cold leadlarni koʻrishda xatolik yuz berdi.');
        }
    }
    async onClosedLeads(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const stats = await this.leadService.getOperatorStats(user.id);
            await ctx.replyWithHTML(`✅ <b>YOPILGAN LEADLAR</b>\n\n` +
                `📊 BUGUN: ${stats.today.closed} ta\n` +
                `📊 BU OY: ${stats.month.closed} ta\n` +
                `📊 JAMI: ${stats.total.closed} ta\n\n` +
                `📈 Konversiya: ${stats.performance.conversionRate}%`);
        }
        catch (error) {
            console.error('ClosedLeads xatosi:', error);
            await ctx.reply('❌ Yopilgan leadlarni koʻrishda xatolik yuz berdi.');
        }
    }
    async onOperatorStats(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const stats = await this.leadService.getOperatorStats(user.id);
            await ctx.replyWithHTML(`📊 <b>SHAXSIY STATISTIKA</b>\n\n` +
                `📋 JAMI: HOT ${stats.total.hot}, WARM ${stats.total.warm}, COLD ${stats.total.cold}\n` +
                `📅 BUGUN: ${stats.today.closed} ta yopilgan\n` +
                `📆 BU OY: ${stats.month.closed} ta yopilgan\n` +
                `📈 Konversiya: ${stats.performance.conversionRate}%\n` +
                `📞 Qo'ng'iroqlar: ${stats.calls?.total || 0} ta`);
        }
        catch (error) {
            console.error('OperatorStats xatosi:', error);
            await ctx.reply('❌ Statistikani koʻrishda xatolik yuz berdi.');
        }
    }
    async onCallHistory(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const calls = await this.leadService.getOperatorCallHistory(user.id);
            if (!calls || calls.length === 0) {
                await ctx.reply('📞 Siz hali qo\'ng\'iroq qilmagansiz.');
                return;
            }
            let message = '📞 <b>QO\'NG\'IROQLAR TARIXI</b>\n\n';
            calls.slice(0, 10).forEach((call, index) => {
                const date = new Date(call.lastCallAt || call.createdAt).toLocaleString('uz-UZ');
                message += `${index + 1}. 🚗 ${call.car?.plateNumber || 'Noma\'lum'}\n`;
                message += `   👤 ${call.car?.ownerName || 'Noma\'lum'}\n`;
                message += `   📞 ${phone_util_1.PhoneUtil.display(call.car?.ownerPhone) || 'Noma\'lum'}\n`;
                message += `   📅 ${date}\n`;
                message += `   📊 Natija: ${this.getCallResultText(call.status)}\n`;
                message += `   🔄 Qo'ng'iroqlar: ${call.callCount || 1} marta\n\n`;
            });
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('CallHistory xatosi:', error);
            await ctx.reply('❌ Qo\'ng\'iroqlar tarixini koʻrishda xatolik.');
        }
    }
    async onDailyPlan(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const todayLeads = await this.leadService.getTodayLeads(user.id);
            const completed = await this.leadService.getTodayCompleted(user.id);
            const postponed = await this.leadService.getTodayPostponed(user.id);
            const plan = await this.leadService.getOperatorDailyPlan(user.id);
            let message = '📅 <b>BUGUNGI REJALAR</b>\n\n';
            message += `📊 <b>STATISTIKA:</b>\n`;
            message += `   • Jami rejalar: ${todayLeads.length} ta\n`;
            message += `   • Bajarilgan: ${completed.length} ta\n`;
            message += `   • Kutilayotgan: ${postponed.length} ta\n`;
            message += `   • Qo'ng'iroqlar: ${plan.totalCalls} ta\n`;
            message += `   • Samaradorlik: ${plan.productivity}%\n\n`;
            if (todayLeads.length > 0) {
                message += `<b>📋 REJALAR RO'YXATI:</b>\n`;
                todayLeads.slice(0, 5).forEach((lead, index) => {
                    message += `${index + 1}. 🚗 ${lead.car?.plateNumber} - ${lead.car?.ownerName}\n`;
                    message += `   ⏳ ${lead.daysRemaining} kun qoldi\n`;
                    message += `   📞 ${phone_util_1.PhoneUtil.display(lead.car?.ownerPhone)}\n`;
                });
            }
            await ctx.replyWithHTML(message, this.operatorKeyboard.getDailyPlanKeyboard());
        }
        catch (error) {
            console.error('DailyPlan xatosi:', error);
            await ctx.reply('❌ Rejalarni koʻrishda xatolik.');
        }
    }
    async onAdminPanel(ctx) {
        try {
            console.log('👑 Admin panel bosildi');
            ctx.session.currentMenu = 'admin';
            await ctx.replyWithHTML('👑 <b>ADMIN PANEL</b>\n\nQuyidagi boʻlimlardan birini tanlang:', this.adminKeyboard.getAdminMainKeyboard());
        }
        catch (error) {
            console.error('Admin panel xatosi:', error);
            await ctx.reply('❌ Admin panelni ochishda xatolik yuz berdi.');
        }
    }
    async onStats(ctx) {
        try {
            console.log('📊 Statistika bosildi');
            ctx.session.currentMenu = 'stats';
            await ctx.replyWithHTML('📊 <b>STATISTIKA BOʻLIMI</b>\n\nQuyidagi boʻlimlardan birini tanlang:', this.adminKeyboard.getStatsKeyboard());
        }
        catch (error) {
            console.error('Stats xatosi:', error);
            await ctx.reply('❌ Statistika boʻlimini ochishda xatolik yuz berdi.');
        }
    }
    async onTodayStats(ctx) {
        try {
            const users = await this.userService.getActiveUsersCount();
            const cars = await this.carService.getTodayCount();
            const leads = await this.leadService.getTodayCount();
            const kpi = await this.kpiService.getTodayTotal();
            await ctx.replyWithHTML(`📊 <b>BUGUNGI STATISTIKA</b>\n\n` +
                `👥 Faol userlar: ${users} ta\n` +
                `🚗 Avtomobillar: ${cars} ta\n` +
                `📋 Leadlar: ${leads} ta\n` +
                `💰 KPI: ${kpi.toLocaleString()} soʻm`);
        }
        catch (error) {
            console.error('TodayStats xatosi:', error);
            await ctx.reply('❌ Bugungi statistikani koʻrishda xatolik yuz berdi.');
        }
    }
    async onMonthStats(ctx) {
        try {
            const cars = await this.carService.getMonthCount();
            const leads = await this.leadService.getMonthCount();
            const kpi = await this.kpiService.getMonthTotal();
            const top = await this.leadService.getTopOperator();
            await ctx.replyWithHTML(`📆 <b>OYLIK STATISTIKA</b>\n\n` +
                `🚗 Avtomobillar: ${cars} ta\n` +
                `📋 Leadlar: ${leads} ta\n` +
                `💰 Jami KPI: ${kpi.toLocaleString()} soʻm\n\n` +
                `🏆 <b>ENG YAXSHI OPERATOR</b>\n` +
                `👤 ${top.name}\n` +
                `📊 ${top.leads} ta lead, ${top.amount.toLocaleString()} soʻm\n` +
                `📞 ${top.calls || 0} ta qo'ng'iroq`);
        }
        catch (error) {
            console.error('MonthStats xatosi:', error);
            await ctx.reply('❌ Oylik statistikani koʻrishda xatolik yuz berdi.');
        }
    }
    async onYearStats(ctx) {
        try {
            const yearStats = await this.kpiService.getYearStats();
            let message = '📈 <b>YILLIK STATISTIKA</b>\n\n';
            if (yearStats.total > 0) {
                message += `📊 Jami KPI: ${yearStats.amount.toLocaleString()} soʻm\n`;
                message += `📋 Registrar: ${yearStats.byType.registrar} ta\n`;
                message += `🎮 Operator: ${yearStats.byType.operator} ta\n\n`;
                message += '<b>Oylar boʻyicha:</b>\n';
                yearStats.monthly.forEach((m) => {
                    if (m.count > 0) {
                        message += `   ${m.monthName}: ${m.count} ta (${m.amount.toLocaleString()} soʻm)\n`;
                    }
                });
            }
            else {
                message += yearStats.message || 'Yillik maʼlumotlar mavjud emas';
            }
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('YearStats xatosi:', error);
            await ctx.reply('❌ Yillik statistikani koʻrishda xatolik yuz berdi.');
        }
    }
    async onRating(ctx) {
        try {
            const operatorRating = await this.leadService.getOperatorsRating();
            const registratorRating = await this.kpiService.getUserRating?.() || [];
            if ((!operatorRating || operatorRating.length === 0) &&
                (!registratorRating || registratorRating.length === 0)) {
                await ctx.reply('🏆 Reyting maʼlumotlari mavjud emas.');
                return;
            }
            let message = '🏆 <b>XODIMLAR REYTINGI</b>\n\n';
            if (operatorRating && operatorRating.length > 0) {
                message += '<b>🎮 OPERATORLAR:</b>\n';
                operatorRating.slice(0, 5).forEach((r, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                    message += `${medal} <b>${r.name || 'Nomaʼlum'}</b>\n`;
                    message += `   📊 ${r.closedLeads || 0} ta lead | 💰 ${(r.totalEarned || 0).toLocaleString()} soʻm\n`;
                    message += `   📞 ${r.totalCalls || 0} ta qo'ng'iroq\n`;
                    if (r.conversionRate)
                        message += `   📈 Konversiya: ${r.conversionRate}%\n`;
                });
                message += '\n';
            }
            if (registratorRating && registratorRating.length > 0) {
                message += '<b>📋 REGISTRATORLAR:</b>\n';
                registratorRating.slice(0, 5).forEach((r, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                    message += `${medal} <b>${r.name || 'Nomaʼlum'}</b>\n`;
                    message += `   🚗 ${r.carsAdded || 0} ta avtomobil | 💰 ${(r.totalEarned || 0).toLocaleString()} soʻm\n`;
                });
            }
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('Rating xatosi:', error);
            await ctx.reply('❌ Reytingni koʻrishda xatolik yuz berdi.');
        }
    }
    async onLeadStats(ctx) {
        try {
            const [daily, weekly, monthly, yearly] = await Promise.all([
                this.leadService.getLeadAnalytics('day').catch(() => null),
                this.leadService.getLeadAnalytics('week').catch(() => null),
                this.leadService.getLeadAnalytics('month').catch(() => null),
                this.leadService.getLeadAnalytics('year').catch(() => null)
            ]);
            let message = '📊 <b>LEAD STATISTIKASI</b>\n\n';
            message += '<b>📅 KUNLIK:</b>\n';
            if (daily && daily.total > 0) {
                message += `   Jami: ${daily.total} ta\n`;
                message += `   🔥 HOT: ${daily.byType?.hot || 0} ta\n`;
                message += `   🌤 WARM: ${daily.byType?.warm || 0} ta\n`;
                message += `   ❄️ COLD: ${daily.byType?.cold || 0} ta\n`;
                message += `   ✅ Yopilgan: ${daily.byStatus?.closed || 0} ta\n`;
                message += `   📞 Qo'ng'iroqlar: ${daily.totalCalls || 0} ta\n`;
                message += `   📈 Konversiya: ${daily.conversion || 0}%\n`;
            }
            else {
                message += `   ${daily?.message || 'Bugungi kun uchun lead maʼlumotlari mavjud emas'}\n`;
            }
            message += '\n';
            message += '<b>📆 HAFTALIK:</b>\n';
            if (weekly && weekly.total > 0) {
                message += `   Jami: ${weekly.total} ta\n`;
                message += `   ✅ Yopilgan: ${weekly.byStatus?.closed || 0} ta\n`;
                message += `   📞 Qo'ng'iroqlar: ${weekly.totalCalls || 0} ta\n`;
            }
            else {
                message += `   ${weekly?.message || 'Oxirgi 7 kun uchun lead maʼlumotlari mavjud emas'}\n`;
            }
            message += '\n';
            message += '<b>📊 OYLIK:</b>\n';
            if (monthly && monthly.total > 0) {
                message += `   Jami: ${monthly.total} ta\n`;
                message += `   🔥 HOT: ${monthly.byType?.hot || 0} ta\n`;
                message += `   🌤 WARM: ${monthly.byType?.warm || 0} ta\n`;
                message += `   ❄️ COLD: ${monthly.byType?.cold || 0} ta\n`;
                message += `   ✅ Yopilgan: ${monthly.byStatus?.closed || 0} ta\n`;
                message += `   📞 Qo'ng'iroqlar: ${monthly.totalCalls || 0} ta\n`;
                message += `   📈 Konversiya: ${monthly.conversion || 0}%\n`;
            }
            else {
                message += `   ${monthly?.message || 'Bu oy uchun lead maʼlumotlari mavjud emas'}\n`;
            }
            message += '\n';
            message += '<b>📈 YILLIK:</b>\n';
            if (yearly && yearly.total > 0) {
                message += `   Jami: ${yearly.total} ta\n`;
                message += `   🔥 HOT: ${yearly.byType?.hot || 0} ta\n`;
                message += `   🌤 WARM: ${yearly.byType?.warm || 0} ta\n`;
                message += `   ❄️ COLD: ${yearly.byType?.cold || 0} ta\n`;
                message += `   ✅ Yopilgan: ${yearly.byStatus?.closed || 0} ta\n`;
                message += `   📞 Qo'ng'iroqlar: ${yearly.totalCalls || 0} ta\n`;
                message += `   📈 Konversiya: ${yearly.conversion || 0}%\n`;
                if (yearly.monthly && yearly.monthly.some((m) => m.total > 0)) {
                    message += '\n<b>Oylar boʻyicha:</b>\n';
                    yearly.monthly.forEach((m) => {
                        if (m.total > 0) {
                            message += `   ${m.monthName}: ${m.total} ta (${m.closed} ta yopilgan)\n`;
                        }
                    });
                }
            }
            else {
                message += `   ${yearly?.message || `${new Date().getFullYear()} yil uchun lead maʼlumotlari mavjud emas`}\n`;
            }
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('LeadStats xatosi:', error);
            await ctx.reply('❌ Lead statistikasini koʻrishda xatolik yuz berdi.');
        }
    }
    async onKpiStats(ctx) {
        try {
            const [daily, weekly, monthly, yearly] = await Promise.all([
                this.kpiService.getKpiStats('day').catch(() => null),
                this.kpiService.getKpiStats('week').catch(() => null),
                this.kpiService.getKpiStats('month').catch(() => null),
                this.kpiService.getYearStats().catch(() => null)
            ]);
            let message = '💰 <b>KPI STATISTIKASI</b>\n\n';
            message += '<b>📅 KUNLIK:</b>\n';
            if (daily && daily.total > 0) {
                message += `   Jami: ${daily.total} ta\n`;
                message += `   Summa: ${daily.amount.toLocaleString()} soʻm\n`;
            }
            else {
                message += `   ${daily?.message || 'Bugungi kun uchun KPI maʼlumotlari mavjud emas'}\n`;
            }
            message += '\n';
            message += '<b>📆 HAFTALIK:</b>\n';
            if (weekly && weekly.total > 0) {
                message += `   Jami: ${weekly.total} ta\n`;
                message += `   Summa: ${weekly.amount.toLocaleString()} soʻm\n`;
            }
            else {
                message += `   ${weekly?.message || 'Oxirgi 7 kun uchun KPI maʼlumotlari mavjud emas'}\n`;
            }
            message += '\n';
            message += '<b>📊 OYLIK:</b>\n';
            if (monthly && monthly.total > 0) {
                message += `   Jami: ${monthly.total} ta\n`;
                message += `   Summa: ${monthly.amount.toLocaleString()} soʻm\n`;
                message += `   📋 Registrar: ${monthly.byType?.registrar || 0} ta\n`;
                message += `   🎮 Operator: ${monthly.byType?.operator || 0} ta\n`;
            }
            else {
                message += `   ${monthly?.message || 'Bu oy uchun KPI maʼlumotlari mavjud emas'}\n`;
            }
            message += '\n';
            message += '<b>📈 YILLIK:</b>\n';
            if (yearly && yearly.total > 0) {
                message += `   Jami: ${yearly.total} ta\n`;
                message += `   Summa: ${yearly.amount.toLocaleString()} soʻm\n`;
                message += `   📋 Registrar: ${yearly.byType?.registrar || 0} ta\n`;
                message += `   🎮 Operator: ${yearly.byType?.operator || 0} ta\n\n`;
                if (yearly.monthly && yearly.monthly.some((m) => m.count > 0)) {
                    message += '<b>Oylar boʻyicha:</b>\n';
                    yearly.monthly.forEach((m) => {
                        if (m.count > 0) {
                            message += `   ${m.monthName}: ${m.count} ta (${m.amount.toLocaleString()} soʻm)\n`;
                        }
                    });
                }
            }
            else {
                message += `   ${yearly?.message || `${new Date().getFullYear()} yil uchun KPI maʼlumotlari mavjud emas`}\n`;
            }
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('KpiStats xatosi:', error);
            await ctx.reply('❌ KPI statistikasini koʻrishda xatolik yuz berdi.');
        }
    }
    async onUsers(ctx) {
        try {
            console.log('👥 Foydalanuvchilar bosildi');
            ctx.session.currentMenu = 'users';
            const counts = await this.userService.getUsersCountByRole();
            await ctx.replyWithHTML('👥 <b>FOYDALANUVCHILAR BOʻLIMI</b>\n\n' +
                `📊 <b>STATISTIKA:</b>\n` +
                `👑 Adminlar: ${counts.admin} ta\n` +
                `🎮 Operatorlar: ${counts.operator} ta\n` +
                `📋 Registratorlar: ${counts.registrar} ta\n\n` +
                `Quyidagi boʻlimlardan birini tanlang:`, this.adminKeyboard.getUserManagementKeyboard());
        }
        catch (error) {
            console.error('Users xatosi:', error);
            await ctx.reply('❌ Foydalanuvchilar boʻlimini ochishda xatolik yuz berdi.');
        }
    }
    async onAdminsList(ctx) {
        try {
            const admins = await this.userService.getAdmins();
            if (admins.length === 0) {
                await ctx.reply('👑 Adminlar mavjud emas.');
                return;
            }
            let message = '👑 <b>ADMINLAR RO\'YXATI</b>\n\n';
            admins.forEach((admin, index) => {
                message += `${index + 1}. <b>${admin.firstName || admin.username || 'Noma\'lum'}</b>\n`;
                message += `   🆔 ID: ${admin.telegramId}\n`;
                message += `   📞 Tel: ${admin.phone || 'Noma\'lum'}\n`;
                message += `   📅 Qo\'shilgan: ${new Date(admin.createdAt).toLocaleDateString('uz-UZ')}\n\n`;
            });
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('Admins list error:', error);
            await ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async onOperatorsList(ctx) {
        try {
            const operators = await this.userService.getOperators();
            if (operators.length === 0) {
                await ctx.reply('🎮 Operatorlar mavjud emas.');
                return;
            }
            let message = '🎮 <b>OPERATORLAR RO\'YXATI</b>\n\n';
            for (const op of operators) {
                const stats = await this.leadService.getOperatorStats(op.id).catch(() => null);
                const callStats = await this.leadService.getCallStats(op.id, 'month').catch(() => null);
                message += `<b>${op.firstName || op.username || 'Noma\'lum'}</b>\n`;
                message += `   🆔 ID: ${op.telegramId}\n`;
                message += `   📞 Tel: ${op.phone || 'Noma\'lum'}\n`;
                if (stats) {
                    message += `   📊 Leadlar: HOT ${stats.total.hot}, WARM ${stats.total.warm}, COLD ${stats.total.cold}\n`;
                    message += `   ✅ Yopilgan: ${stats.total.closed} ta\n`;
                    message += `   📞 Qo'ng'iroqlar: ${callStats?.totalCalls || 0} ta\n`;
                    message += `   📈 Konversiya: ${stats.performance.conversionRate}%\n`;
                }
                message += `   📅 Qo\'shilgan: ${new Date(op.createdAt).toLocaleDateString('uz-UZ')}\n\n`;
            }
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('Operators list error:', error);
            await ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async onRegistrarsList(ctx) {
        try {
            const registrars = await this.userService.getRegistrars();
            if (registrars.length === 0) {
                await ctx.reply('📋 Registratorlar mavjud emas.');
                return;
            }
            let message = '📋 <b>REGISTRATORLAR RO\'YXATI</b>\n\n';
            for (const reg of registrars) {
                const stats = await this.kpiService.getUserStats(reg.id).catch(() => null);
                message += `<b>${reg.firstName || reg.username || 'Noma\'lum'}</b>\n`;
                message += `   🆔 ID: ${reg.telegramId}\n`;
                message += `   📞 Tel: ${reg.phone || 'Noma\'lum'}\n`;
                if (stats) {
                    message += `   🚗 Avtomobillar: ${stats.carsCount || 0} ta\n`;
                    message += `   💰 KPI: ${(stats.totalEarned || 0).toLocaleString()} soʻm\n`;
                }
                message += `   📅 Qo\'shilgan: ${new Date(reg.createdAt).toLocaleDateString('uz-UZ')}\n\n`;
            }
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('Registrars list error:', error);
            await ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async onAllUsers(ctx) {
        try {
            const users = await this.userService.getAllUsers();
            if (!users || users.length === 0) {
                await ctx.reply('👥 Foydalanuvchilar mavjud emas.');
                return;
            }
            let message = '👥 <b>BARChA FOYDALANUVCHILAR</b>\n\n';
            users.slice(0, 20).forEach(u => {
                const icon = u.role === 'admin' ? '👑' : u.role === 'operator' ? '🎮' : '📋';
                message += `${icon} <b>${u.firstName || u.username || 'Nomaʼlum'}</b>\n`;
                message += `   🆔 ${u.telegramId}\n`;
                message += `   📞 ${u.phone || 'Nomaʼlum'}\n`;
                message += `   📋 ${u.role}\n\n`;
            });
            if (users.length > 20) {
                message += `... va yana ${users.length - 20} ta foydalanuvchi`;
            }
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('AllUsers xatosi:', error);
            await ctx.reply('❌ Userlar roʻyxatini koʻrishda xatolik yuz berdi.');
        }
    }
    async onAddOperator(ctx) {
        try {
            await ctx.reply('➕ <b>OPERATOR QO\'SHISH</b>\n\n' +
                'Operator qilmoqchi bo\'lgan foydalanuvchining Telegram ID sini yuboring.\n\n' +
                'Masalan: <code>123456789</code>\n\n' +
                '<i>Foydalanuvchi avval botga /start yozgan bo\'lishi kerak!</i>', { parse_mode: 'HTML' });
            ctx.session = {
                ...ctx.session,
                waitingFor: 'operator_add'
            };
        }
        catch (error) {
            console.error('AddOperator xatosi:', error);
            await ctx.reply('❌ Operator qo\'shishda xatolik yuz berdi.');
        }
    }
    async onDeleteOperator(ctx) {
        try {
            const operators = await this.userService.getByRole('operator');
            if (operators.length === 0) {
                await ctx.reply('🎮 Operatorlar mavjud emas.');
                return;
            }
            let message = '🎮 <b>OPERATORLAR RO\'YXATI</b>\n\n';
            const buttons = [];
            operators.forEach((op, index) => {
                message += `${index + 1}. ${op.firstName || op.username} (ID: ${op.telegramId})\n`;
                buttons.push([
                    telegraf_1.Markup.button.callback(`❌ ${op.firstName || op.username}`, `delete_operator_${op.telegramId}`)
                ]);
            });
            await ctx.replyWithHTML(message);
            await ctx.reply('O\'chirmoqchi bo\'lgan operatorni tanlang:', {
                reply_markup: { inline_keyboard: buttons }
            });
        }
        catch (error) {
            console.error('DeleteOperator xatosi:', error);
            await ctx.reply('❌ Operator oʻchirishda xatolik yuz berdi.');
        }
    }
    async onAddAdmin(ctx) {
        try {
            await ctx.reply('👑 <b>ADMIN QO\'SHISH</b>\n\n' +
                'Admin qilmoqchi bo\'lgan foydalanuvchining Telegram ID sini yuboring.\n\n' +
                'Masalan: <code>123456789</code>\n\n' +
                '<i>Foydalanuvchi avval botga /start yozgan bo\'lishi kerak!</i>', { parse_mode: 'HTML' });
            ctx.session = {
                ...ctx.session,
                waitingFor: 'admin_add'
            };
        }
        catch (error) {
            console.error('AddAdmin xatosi:', error);
            await ctx.reply('❌ Admin qo\'shishda xatolik yuz berdi.');
        }
    }
    async onDeleteAdmin(ctx) {
        try {
            const admins = await this.userService.getByRole('admin');
            if (admins.length === 0) {
                await ctx.reply('👑 Adminlar mavjud emas.');
                return;
            }
            let message = '👑 <b>ADMINLAR RO\'YXATI</b>\n\n';
            const buttons = [];
            admins.forEach((admin, index) => {
                message += `${index + 1}. ${admin.firstName || admin.username} (ID: ${admin.telegramId})\n`;
                buttons.push([
                    telegraf_1.Markup.button.callback(`❌ ${admin.firstName || admin.username}`, `delete_admin_${admin.telegramId}`)
                ]);
            });
            await ctx.replyWithHTML(message);
            await ctx.reply('O\'chirmoqchi bo\'lgan adminni tanlang:', {
                reply_markup: { inline_keyboard: buttons }
            });
        }
        catch (error) {
            console.error('DeleteAdmin xatosi:', error);
            await ctx.reply('❌ Admin oʻchirishda xatolik yuz berdi.');
        }
    }
    async onChangeRole(ctx) {
        try {
            await ctx.reply('📋 <b>ROL O\'ZGARTIRISH</b>\n\n' +
                'Rol o\'zgartirmoqchi bo\'lgan foydalanuvchining Telegram ID sini va yangi rolini yuboring.\n\n' +
                'Masalan: <code>123456789 operator</code>\n\n' +
                'Rollar: <code>registrar</code>, <code>operator</code>, <code>admin</code>', { parse_mode: 'HTML' });
            ctx.session = {
                ...ctx.session,
                waitingFor: 'role_change'
            };
        }
        catch (error) {
            console.error('ChangeRole xatosi:', error);
            await ctx.reply('❌ Rol oʻzgartirishda xatolik yuz berdi.');
        }
    }
    async onCars(ctx) {
        try {
            console.log('🚗 Avtomobillar bosildi');
            ctx.session.currentMenu = 'cars';
            await ctx.replyWithHTML('🚗 <b>AVTOMOBILLAR BOʻLIMI</b>\n\nQuyidagi boʻlimlardan birini tanlang:', this.adminKeyboard.getCarsKeyboard());
        }
        catch (error) {
            console.error('Cars xatosi:', error);
            await ctx.reply('❌ Avtomobillar boʻlimini ochishda xatolik yuz berdi.');
        }
    }
    async onAllCars(ctx) {
        try {
            const cars = await this.carService.findAllWithInsurances();
            if (!cars || cars.length === 0) {
                await ctx.reply('🚗 Avtomobillar mavjud emas.');
                return;
            }
            let message = '🚗 <b>BARChA AVTOMOBILLAR</b>\n\n';
            cars.slice(0, 10).forEach((car, index) => {
                const activeInsurance = car.insurances?.find(i => i.status === 'active');
                const endDate = activeInsurance
                    ? new Date(activeInsurance.endDate).toLocaleDateString('uz-UZ')
                    : 'Mavjud emas';
                message += `${index + 1}. <b>${car.plateNumber}</b>\n`;
                message += `   👤 Ega: ${car.ownerName || 'Nomaʼlum'}\n`;
                message += `   📞 Asosiy tel: ${phone_util_1.PhoneUtil.display(car.ownerPhone)}\n`;
                if (car.secondPhone) {
                    message += `   📞 Ikkinchi tel: ${phone_util_1.PhoneUtil.display(car.secondPhone)}\n`;
                }
                if (car.secondPlateNumber) {
                    message += `   ➕ Ikkinchi raqam: ${car.secondPlateNumber}\n`;
                }
                if (car.techPhoto || car.carPhoto) {
                    message += `   📸 Rasmlar: `;
                    if (car.techPhoto)
                        message += `[Tex pasport] `;
                    if (car.carPhoto)
                        message += `[Mashina] `;
                    message += `\n`;
                }
                message += `   📅 Sugʻurta: ${endDate}\n`;
                message += `   🆔 ID: ${car.id}\n\n`;
            });
            if (cars.length > 10) {
                message += `... va yana ${cars.length - 10} ta avtomobil`;
            }
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('AllCars xatosi:', error);
            await ctx.reply('❌ Avtomobillarni koʻrishda xatolik yuz berdi.');
        }
    }
    async onAddCarAdmin(ctx) {
        try {
            if (!ctx.scene) {
                await ctx.reply('❌ Scene tizimi ishlamayapti. Administratorga murojaat qiling.');
                return;
            }
            await ctx.scene.enter(bot_constants_1.SCENES.addCar);
        }
        catch (error) {
            console.error('AddCarAdmin xatosi:', error);
            await ctx.reply('❌ Avtomobil qoʻshishda xatolik yuz berdi.');
        }
    }
    async onSearchCar(ctx) {
        try {
            ctx.session = {
                ...ctx.session,
                waitingFor: 'search_car'
            };
            await ctx.reply('🔍 Qidirmoqchi bo\'lgan avtomobil raqamini, ikkinchi raqamini, telefon raqamini yoki egasining ismini kiriting:', {
                reply_markup: {
                    keyboard: [
                        ['❌ Bekor qilish']
                    ],
                    resize_keyboard: true
                }
            });
        }
        catch (error) {
            console.error('Search car error:', error);
            await ctx.reply('❌ Xatolik yuz berdi.');
        }
    }
    async onExpiringCars(ctx) {
        try {
            const expiringCars = await this.carService.getExpiringCars(30);
            if (!expiringCars || expiringCars.length === 0) {
                await ctx.reply('✅ Sugʻurtasi 30 kun ichida tugaydigan avtomobillar mavjud emas.');
                return;
            }
            let message = '⚠️ <b>30 KUN ICHIDA SUGʻURTASI TUGA DIGANLAR</b>\n\n';
            expiringCars.forEach((car, index) => {
                const activeInsurance = car.insurances?.find(i => i.status === 'active');
                if (activeInsurance) {
                    const daysLeft = date_util_1.DateUtil.daysRemaining(activeInsurance.endDate);
                    const endDate = new Date(activeInsurance.endDate).toLocaleDateString('uz-UZ');
                    message += `${index + 1}. <b>${car.plateNumber}</b>\n`;
                    message += `   👤 Ega: ${car.ownerName}\n`;
                    message += `   📞 Tel: ${phone_util_1.PhoneUtil.display(car.ownerPhone)}\n`;
                    if (car.secondPhone) {
                        message += `   📞 Ikkinchi tel: ${phone_util_1.PhoneUtil.display(car.secondPhone)}\n`;
                    }
                    if (car.secondPlateNumber) {
                        message += `   ➕ Ikkinchi raqam: ${car.secondPlateNumber}\n`;
                    }
                    message += `   📅 Tugash sanasi: ${endDate}\n`;
                    message += `   ⏳ ${daysLeft} kun qoldi\n\n`;
                }
            });
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('ExpiringCars xatosi:', error);
            await ctx.reply('❌ Maʼlumotlarni olishda xatolik yuz berdi.');
        }
    }
    async onExpiredCars(ctx) {
        try {
            const expired = await this.carService.getExpiredCars();
            if (!expired || expired.length === 0) {
                await ctx.reply('✅ Muddati oʻtgan avtomobillar mavjud emas.');
                return;
            }
            let message = '❌ <b>MUDDATI OʻTGAN AVTOMOBILLAR</b>\n\n';
            expired.slice(0, 10).forEach((car, index) => {
                const expiredInsurance = car.insurances?.find(i => i.status === 'expired');
                const endDate = expiredInsurance
                    ? new Date(expiredInsurance.endDate).toLocaleDateString('uz-UZ')
                    : 'Mavjud emas';
                message += `${index + 1}. <b>${car.plateNumber}</b>\n`;
                message += `   👤 Ega: ${car.ownerName}\n`;
                message += `   📞 Tel: ${phone_util_1.PhoneUtil.display(car.ownerPhone)}\n`;
                if (car.secondPhone) {
                    message += `   📞 Ikkinchi tel: ${phone_util_1.PhoneUtil.display(car.secondPhone)}\n`;
                }
                if (car.secondPlateNumber) {
                    message += `   ➕ Ikkinchi raqam: ${car.secondPlateNumber}\n`;
                }
                message += `   📅 Tugagan sana: ${endDate}\n\n`;
            });
            if (expired.length > 10) {
                message += `... va yana ${expired.length - 10} ta avtomobil`;
            }
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('ExpiredCars xatosi:', error);
            await ctx.reply('❌ Maʼlumotlarni olishda xatolik yuz berdi.');
        }
    }
    async onCarStats(ctx) {
        try {
            const stats = await this.carService.getCarStats();
            await ctx.replyWithHTML(`📊 <b>AVTOMOBIL STATISTIKASI</b>\n\n` +
                `🚗 Jami avtomobillar: ${stats.total} ta\n` +
                `✅ Aktiv sugʻurta: ${stats.active} ta\n` +
                `⚠️ 30 kunda tugaydigan: ${stats.expiring} ta\n` +
                `❌ Muddati oʻtgan: ${stats.expired} ta\n` +
                `📞 Ikkinchi telefonli: ${stats.withSecondPhone || 0} ta\n\n` +
                `📅 Bugun qoʻshilgan: ${stats.today} ta\n` +
                `📆 Shu oyda: ${stats.month} ta`);
        }
        catch (error) {
            console.error('CarStats xatosi:', error);
            await ctx.reply('❌ Statistikani olishda xatolik yuz berdi.');
        }
    }
    async onAdminLeads(ctx) {
        try {
            console.log('📋 Leadlar (Admin) bosildi');
            ctx.session.currentMenu = 'leads';
            await ctx.replyWithHTML('📋 <b>LEADLAR BOʻLIMI</b>\n\nQuyidagi boʻlimlardan birini tanlang:', this.adminKeyboard.getLeadManagementKeyboard());
        }
        catch (error) {
            console.error('AdminLeads xatosi:', error);
            await ctx.reply('❌ Leadlar boʻlimini ochishda xatolik yuz berdi.');
        }
    }
    async onLeadReport(ctx) {
        try {
            const report = await this.leadService.getDailyReport();
            await ctx.replyWithHTML(`📊 <b>LEAD HISOBOTI</b>\n\n` +
                `📅 Sana: ${new Date(report.date).toLocaleDateString('uz-UZ')}\n` +
                `📋 Jami: ${report.totalLeads} ta\n` +
                `🔥 HOT: ${report.byType.hot} ta\n` +
                `🌤 WARM: ${report.byType.warm} ta\n` +
                `❄️ COLD: ${report.byType.cold} ta\n` +
                `📞 Qo'ng'iroqlar: ${report.totalCalls || 0} ta`);
        }
        catch (error) {
            console.error('LeadReport xatosi:', error);
            await ctx.reply('❌ Lead hisobotini koʻrishda xatolik yuz berdi.');
        }
    }
    async onAssignLeads(ctx) {
        try {
            const assigned = await this.leadService.assignLeadsToOperators();
            await ctx.reply(`📤 ${assigned} ta lead operatorlarga taqsimlandi.`);
        }
        catch (error) {
            console.error('AssignLeads xatosi:', error);
            await ctx.reply('❌ Leadlarni taqsimlashda xatolik yuz berdi.');
        }
    }
    async onFinance(ctx) {
        try {
            console.log('💰 Moliya bosildi');
            ctx.session.currentMenu = 'finance';
            await ctx.replyWithHTML('💰 <b>MOLIYA BOʻLIMI</b>\n\nQuyidagi boʻlimlardan birini tanlang:', this.adminKeyboard.getFinanceKeyboard());
        }
        catch (error) {
            console.error('Finance xatosi:', error);
            await ctx.reply('❌ Moliya boʻlimini ochishda xatolik yuz berdi.');
        }
    }
    async onPayments(ctx) {
        try {
            const payments = await this.kpiService.getPendingPayments();
            if (!payments || payments.length === 0) {
                await ctx.reply('💰 Kutilayotgan toʻlovlar mavjud emas.');
                return;
            }
            let message = '💰 <b>TOʻLOVLAR</b>\n\n';
            payments.forEach(p => {
                message += `👤 ${p.name}: ${p.amount.toLocaleString()} soʻm\n`;
            });
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('Payments xatosi:', error);
            await ctx.reply('❌ Toʻlovlarni koʻrishda xatolik yuz berdi.');
        }
    }
    async onCalculateKpi(ctx) {
        try {
            await ctx.reply('💳 KPI hisoblanmoqda...');
            const result = await this.kpiService.calculateMonthlyKpi();
            await ctx.reply(`✅ KPI muvaffaqiyatli hisoblandi!\n💰 Jami: ${result.total.toLocaleString()} so'm`);
        }
        catch (error) {
            console.error('CalculateKpi xatosi:', error);
            await ctx.reply('❌ KPI hisoblashda xatolik yuz berdi.');
        }
    }
    async onMonthlyFinance(ctx) {
        try {
            const monthStats = await this.kpiService.getMonthTotal();
            await ctx.replyWithHTML(`📊 <b>OYLIK MOLIYA</b>\n\n` +
                `💰 Jami toʻlovlar: ${monthStats.toLocaleString()} soʻm`);
        }
        catch (error) {
            console.error('MonthlyFinance xatosi:', error);
            await ctx.reply('❌ Oylik moliyani koʻrishda xatolik yuz berdi.');
        }
    }
    async onIncome(ctx) {
        try {
            const yearStats = await this.kpiService.getYearStats();
            await ctx.replyWithHTML(`📈 <b>DAROMAD</b>\n\n` +
                `💰 Jami: ${yearStats.amount.toLocaleString()} soʻm`);
        }
        catch (error) {
            console.error('Income xatosi:', error);
            await ctx.reply('❌ Daromadni koʻrishda xatolik yuz berdi.');
        }
    }
    async onReports(ctx) {
        try {
            console.log('📊 Hisobotlar bosildi');
            ctx.session.currentMenu = 'reports';
            await ctx.replyWithHTML('📊 <b>HISOBOTLAR BOʻLIMI</b>\n\nQuyidagi hisobotlardan birini tanlang:', this.adminKeyboard.getReportsKeyboard());
        }
        catch (error) {
            console.error('Reports xatosi:', error);
            await ctx.reply('❌ Hisobotlar boʻlimini ochishda xatolik yuz berdi.');
        }
    }
    async onExcelExport(ctx) {
        try {
            await ctx.reply('📥 Excel fayl tayyorlanmoqda, biroz kuting...');
            const cars = await this.carService.findAllWithInsurances();
            const leads = await this.leadService.exportLeads();
            const users = await this.userService.getAllUsers();
            const filePath = await this.excelService.generateFullReport({
                cars,
                leads,
                users,
                date: new Date()
            });
            await ctx.replyWithDocument({ source: filePath });
            setTimeout(() => {
                fs.unlink(filePath, (err) => {
                    if (err)
                        console.error('Faylni o\'chirishda xatolik:', err);
                });
            }, 5000);
        }
        catch (error) {
            console.error('Excel export xatosi:', error);
            await ctx.reply('❌ Excel fayl yaratishda xatolik yuz berdi.');
        }
    }
    async onOperatorReport(ctx) {
        try {
            await ctx.reply('📊 Operator hisoboti tayyorlanmoqda...');
            const ops = await this.leadService.getOperatorsRating();
            const filePath = await this.excelService.generateOperatorReport(ops);
            await ctx.replyWithDocument({ source: filePath });
            setTimeout(() => {
                fs.unlink(filePath, (err) => {
                    if (err)
                        console.error('Faylni o\'chirishda xatolik:', err);
                });
            }, 5000);
        }
        catch (error) {
            console.error('OperatorReport xatosi:', error);
            await ctx.reply('❌ Operator hisobotini yaratishda xatolik yuz berdi.');
        }
    }
    async onLeadReportFull(ctx) {
        try {
            await ctx.reply('📋 Lead hisoboti tayyorlanmoqda...');
            const leads = await this.leadService.exportLeads();
            const filePath = await this.excelService.generateLeadReport(leads);
            await ctx.replyWithDocument({ source: filePath });
            setTimeout(() => {
                fs.unlink(filePath, (err) => {
                    if (err)
                        console.error('Faylni o\'chirishda xatolik:', err);
                });
            }, 5000);
        }
        catch (error) {
            console.error('LeadReportFull xatosi:', error);
            await ctx.reply('❌ Lead hisobotini yaratishda xatolik yuz berdi.');
        }
    }
    async onCarReport(ctx) {
        try {
            await ctx.reply('🚗 Avtomobil hisoboti tayyorlanmoqda...');
            const cars = await this.carService.findAllWithInsurances();
            const filePath = await this.excelService.generateCarReport(cars);
            await ctx.replyWithDocument({ source: filePath });
            setTimeout(() => {
                fs.unlink(filePath, (err) => {
                    if (err)
                        console.error('Faylni o\'chirishda xatolik:', err);
                });
            }, 5000);
        }
        catch (error) {
            console.error('CarReport xatosi:', error);
            await ctx.reply('❌ Avtomobil hisobotini yaratishda xatolik yuz berdi.');
        }
    }
    async onFinanceReport(ctx) {
        try {
            await ctx.reply('💰 Moliya hisoboti tayyorlanmoqda...');
            const yearStats = await this.kpiService.getYearStats();
            const monthTotal = await this.kpiService.getMonthTotal();
            const pendingPayments = await this.kpiService.getPendingPayments();
            const filePath = await this.excelService.generateFinanceReport({
                yearStats,
                monthTotal,
                pendingPayments
            });
            await ctx.replyWithDocument({ source: filePath });
            setTimeout(() => {
                fs.unlink(filePath, (err) => {
                    if (err)
                        console.error('Faylni o\'chirishda xatolik:', err);
                });
            }, 5000);
        }
        catch (error) {
            console.error('FinanceReport xatosi:', error);
            await ctx.reply('❌ Moliya hisobotini yaratishda xatolik yuz berdi.');
        }
    }
    async onInsuranceReport(ctx) {
        try {
            await ctx.reply('📊 Sug\'urta hisoboti tayyorlanmoqda...');
            const stats = await this.insuranceService.getStats();
            const insurances = await this.insuranceService.findAllWithDetails();
            const filePath = await this.excelService.generateInsuranceTypeReport(insurances);
            await ctx.replyWithHTML(`📊 <b>SUG'URTA STATISTIKASI</b>\n\n` +
                `✅ Aktiv: ${stats.active} ta\n` +
                `⚠️ 30 kunda tugaydigan: ${stats.expiring} ta\n` +
                `❌ Muddati oʻtgan: ${stats.expired} ta\n` +
                `🔄 Yangilangan: ${stats.renewed || 0} ta\n\n` +
                `📊 Turlar bo'yicha:\n` +
                `   • 24 kunlik: ${stats.byType?.['24days'] || 0} ta\n` +
                `   • 6 oylik: ${stats.byType?.['6months'] || 0} ta\n` +
                `   • 1 yillik: ${stats.byType?.['1year'] || 0} ta\n\n` +
                `📥 Excel fayl yuborilmoqda...`);
            await ctx.replyWithDocument({ source: filePath });
            setTimeout(() => {
                fs.unlink(filePath, (err) => {
                    if (err)
                        console.error('Faylni o\'chirishda xatolik:', err);
                });
            }, 5000);
        }
        catch (error) {
            console.error('InsuranceReport xatosi:', error);
            await ctx.reply('❌ Sug\'urta hisobotini yaratishda xatolik yuz berdi.');
        }
    }
    async onSettings(ctx) {
        try {
            console.log('⚙️ Sozlamalar bosildi');
            ctx.session.currentMenu = 'settings';
            await ctx.replyWithHTML('⚙️ <b>SOZLAMALAR BOʻLIMI</b>\n\nQuyidagi sozlamalardan birini tanlang:', this.adminKeyboard.getSettingsKeyboard());
        }
        catch (error) {
            console.error('Settings xatosi:', error);
            await ctx.reply('❌ Sozlamalar boʻlimini ochishda xatolik yuz berdi.');
        }
    }
    async onKpiSettings(ctx) {
        try {
            const settings = await this.kpiService.getSettings();
            await ctx.replyWithHTML('⚙️ <b>KPI SOZLAMALARI</b>\n\n' +
                `Hozirgi qiymatlar:\n` +
                `• Registrar: ${settings.registrarRate} soʻm/avtomobil\n` +
                `• Operator (HOT): ${settings.hotRate} soʻm\n` +
                `• Operator (WARM): ${settings.warmRate} soʻm\n` +
                `• Operator (COLD): ${settings.coldRate} soʻm\n\n` +
                `Oʻzgartirish uchun /setkpi [hot] [warm] [cold]`);
        }
        catch (error) {
            console.error('KpiSettings xatosi:', error);
            await ctx.reply('❌ KPI sozlamalarini koʻrishda xatolik yuz berdi.');
        }
    }
    async onNotifications(ctx) {
        try {
            const settings = await this.kpiService.getNotificationSettings();
            await ctx.replyWithHTML('🔔 <b>BILDIRISHNOMALAR</b>\n\n' +
                `• ${settings.notifyDays[0]} kun qolganda: ${settings.enabled ? '✅' : '❌'} Yoqilgan\n` +
                `• ${settings.notifyDays[1]} kun qolganda: ${settings.enabled ? '✅' : '❌'} Yoqilgan\n` +
                `• ${settings.notifyDays[2]} kun qolganda: ${settings.enabled ? '✅' : '❌'} Yoqilgan\n\n` +
                `Oʻzgartirish uchun /setnotif [10] [5] [1]`);
        }
        catch (error) {
            console.error('Notifications xatosi:', error);
            await ctx.reply('❌ Bildirishnomalarni koʻrishda xatolik yuz berdi.');
        }
    }
    async onWorkTime(ctx) {
        try {
            await ctx.replyWithHTML('🕒 <b>ISH VAQTI</b>\n\n' +
                'Dushanba-Juma: 09:00 - 18:00\n' +
                'Shanba: 10:00 - 15:00\n' +
                'Yakshanba: Dam olish kuni\n\n' +
                'Oʻzgartirish uchun /setwork [vaqt]');
        }
        catch (error) {
            console.error('WorkTime xatosi:', error);
            await ctx.reply('❌ Ish vaqtini koʻrishda xatolik yuz berdi.');
        }
    }
    async onBackup(ctx) {
        try {
            await ctx.reply('💾 Backup yaratilmoqda...');
            const backupPath = await this.kpiService.createBackup();
            await ctx.replyWithDocument({ source: backupPath });
            setTimeout(() => {
                fs.unlink(backupPath, (err) => {
                    if (err)
                        console.error('Faylni o\'chirishda xatolik:', err);
                });
            }, 5000);
        }
        catch (error) {
            console.error('Backup xatosi:', error);
            await ctx.reply('❌ Backup yaratishda xatolik yuz berdi.');
        }
    }
    async onInsurances(ctx) {
        try {
            ctx.session.currentMenu = 'insurances';
            await ctx.replyWithHTML('📋 <b>SUGʻURTA BOʻLIMI</b>\n\nQuyidagi boʻlimlardan birini tanlang:', this.adminKeyboard.getInsuranceKeyboard());
        }
        catch (error) {
            console.error('Insurances xatosi:', error);
            await ctx.reply('❌ Sugʻurta boʻlimini ochishda xatolik yuz berdi.');
        }
    }
    async onActiveInsurances(ctx) {
        try {
            const insurances = await this.insuranceService.getActive();
            if (!insurances || insurances.length === 0) {
                await ctx.reply('📋 Aktiv sugʻurtalar mavjud emas.');
                return;
            }
            let message = '✅ <b>AKTIV SUGʻURTALAR</b>\n\n';
            insurances.slice(0, 10).forEach((ins, index) => {
                const endDate = new Date(ins.endDate).toLocaleDateString('uz-UZ');
                const typeText = {
                    '24days': '24 kunlik',
                    '6months': '6 oylik',
                    '1year': '1 yillik',
                    'custom': 'Maxsus'
                }[ins.type] || 'Standart';
                message += `${index + 1}. 🚗 <b>${ins.car?.plateNumber}</b>\n`;
                message += `   📋 Turi: ${typeText}\n`;
                message += `   👤 Ega: ${ins.car?.ownerName}\n`;
                message += `   📞 Tel: ${phone_util_1.PhoneUtil.display(ins.car?.ownerPhone)}\n`;
                if (ins.car?.secondPhone) {
                    message += `   📞 Ikkinchi tel: ${phone_util_1.PhoneUtil.display(ins.car.secondPhone)}\n`;
                }
                message += `   📅 Tugash: ${endDate}\n\n`;
            });
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('ActiveInsurances xatosi:', error);
            await ctx.reply('❌ Maʼlumotlarni olishda xatolik yuz berdi.');
        }
    }
    async onExpiredInsurances(ctx) {
        try {
            const expired = await this.insuranceService.getExpired();
            if (!expired || expired.length === 0) {
                await ctx.reply('✅ Muddati oʻtgan sugʻurtalar mavjud emas.');
                return;
            }
            let message = '❌ <b>MUDDATI OʻTGAN SUGʻURTALAR</b>\n\n';
            expired.slice(0, 10).forEach((ins, index) => {
                const endDate = new Date(ins.endDate).toLocaleDateString('uz-UZ');
                message += `${index + 1}. 🚗 <b>${ins.car?.plateNumber}</b>\n`;
                message += `   👤 Ega: ${ins.car?.ownerName}\n`;
                message += `   📞 Tel: ${phone_util_1.PhoneUtil.display(ins.car?.ownerPhone)}\n`;
                if (ins.car?.secondPhone) {
                    message += `   📞 Ikkinchi tel: ${phone_util_1.PhoneUtil.display(ins.car.secondPhone)}\n`;
                }
                message += `   📅 Tugagan sana: ${endDate}\n\n`;
            });
            await ctx.replyWithHTML(message);
        }
        catch (error) {
            console.error('ExpiredInsurances xatosi:', error);
            await ctx.reply('❌ Maʼlumotlarni olishda xatolik yuz berdi.');
        }
    }
    async onInsuranceStats(ctx) {
        try {
            const stats = await this.insuranceService.getStats();
            await ctx.replyWithHTML(`📊 <b>SUGʻURTA STATISTIKASI</b>\n\n` +
                `✅ Aktiv: ${stats.active} ta\n` +
                `⚠️ 30 kunda tugaydigan: ${stats.expiring} ta\n` +
                `❌ Muddati oʻtgan: ${stats.expired} ta\n` +
                `🔄 Yangilangan: ${stats.renewed || 0} ta\n\n` +
                `📅 Shu oyda: ${stats.monthly || 0} ta\n` +
                `📊 Turlar bo'yicha:\n` +
                `   • 24 kunlik: ${stats.byType?.['24days'] || 0} ta\n` +
                `   • 6 oylik: ${stats.byType?.['6months'] || 0} ta\n` +
                `   • 1 yillik: ${stats.byType?.['1year'] || 0} ta`);
        }
        catch (error) {
            console.error('InsuranceStats xatosi:', error);
            await ctx.reply('❌ Statistikani olishda xatolik yuz berdi.');
        }
    }
    async onLeadClose(ctx) {
        try {
            const leadId = parseInt(ctx.callbackQuery['data'].split('_')[1]);
            const user = await this.botService.findOrCreateUser(ctx.from);
            const lead = await this.leadService.findById(leadId);
            const amount = this.kpiService.calculateLeadAmount(lead.leadType);
            await this.leadService.updateLeadStatus(leadId, 'closed', user.id);
            await this.userService.notifyAdminsAboutClosedLead(lead, user, amount);
            await ctx.answerCbQuery('✅ Lead yopildi');
            await ctx.editMessageText('Lead muvaffaqiyatli yopildi!');
        }
        catch (error) {
            console.error('LeadClose xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onLeadLater(ctx) {
        try {
            const leadId = parseInt(ctx.callbackQuery['data'].split('_')[1]);
            const user = await this.botService.findOrCreateUser(ctx.from);
            await this.leadService.updateLeadStatus(leadId, 'postponed', user.id, 'Keyinroq qoʻngʻiroq qilish kerak');
            await ctx.answerCbQuery('⏳ Keyinroq eslatiladi');
            await ctx.editMessageText('Eslatma belgilandi!');
        }
        catch (error) {
            console.error('LeadLater xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onLeadReject(ctx) {
        try {
            const leadId = parseInt(ctx.callbackQuery['data'].split('_')[1]);
            const user = await this.botService.findOrCreateUser(ctx.from);
            await this.leadService.updateLeadStatus(leadId, 'rejected', user.id, 'Mijoz rad etdi');
            await ctx.answerCbQuery('✖ Lead rad etildi');
            await ctx.editMessageText('Lead rad etildi!');
        }
        catch (error) {
            console.error('LeadReject xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onLeadCall(ctx) {
        try {
            const leadId = parseInt(ctx.callbackQuery['data'].split('_')[1]);
            const lead = await this.leadService.findById(leadId);
            await ctx.answerCbQuery('📞 Qoʻngʻiroq qilinmoqda...');
            await this.leadService.logCall(leadId, ctx.from.id);
            const message = `📞 <b>QO'NG'IROQ QILINMOQDA</b>\n\n` +
                `🚗 Avtomobil: <b>${lead.car?.plateNumber}</b>\n` +
                `👤 Mijoz: <b>${lead.car?.ownerName}</b>\n` +
                `📞 Asosiy tel: <code>${phone_util_1.PhoneUtil.display(lead.car?.ownerPhone)}</code>\n` +
                `📞 Ikkinchi tel: <code>${phone_util_1.PhoneUtil.display(lead.car?.secondPhone) || 'Mavjud emas'}</code>\n` +
                `⏳ Qolgan kun: ${lead.daysRemaining} kun\n\n` +
                `📋 Qo'ng'iroq natijasini tanlang:`;
            await ctx.editMessageText(message, {
                parse_mode: 'HTML',
                reply_markup: this.operatorKeyboard.getCallResultKeyboard(leadId).reply_markup
            });
        }
        catch (error) {
            console.error('LeadCall xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onRecall(ctx) {
        try {
            const leadId = parseInt(ctx.callbackQuery['data'].split('_')[1]);
            await ctx.answerCbQuery('⏳ Qayta qoʻngʻiroq vaqtini tanlang...');
            await ctx.editMessageText('📅 Qayta qoʻngʻiroq vaqtini tanlang:', {
                reply_markup: this.operatorKeyboard.getReminderTimeKeyboard(leadId).reply_markup
            });
        }
        catch (error) {
            console.error('Recall xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onAddNote(ctx) {
        try {
            const leadId = parseInt(ctx.callbackQuery['data'].split('_')[1]);
            ctx.session = {
                ...ctx.session,
                waitingFor: 'lead_note',
                leadId: leadId
            };
            await ctx.editMessageText('📝 Eslatma matnini kiriting:');
            await ctx.reply('📝 Eslatma matnini kiriting:', {
                reply_markup: {
                    keyboard: [
                        ['❌ Bekor qilish']
                    ],
                    resize_keyboard: true
                }
            });
        }
        catch (error) {
            console.error('AddNote xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onSetReminder(ctx) {
        try {
            const parts = ctx.callbackQuery['data'].split('_');
            const time = parts[1];
            const leadId = parseInt(parts[2]);
            let remindDate = new Date();
            switch (time) {
                case '1h':
                    remindDate.setHours(remindDate.getHours() + 1);
                    break;
                case '3h':
                    remindDate.setHours(remindDate.getHours() + 3);
                    break;
                case 'tomorrow':
                    remindDate.setDate(remindDate.getDate() + 1);
                    remindDate.setHours(9, 0, 0, 0);
                    break;
                case '3d':
                    remindDate.setDate(remindDate.getDate() + 3);
                    remindDate.setHours(9, 0, 0, 0);
                    break;
                case 'week':
                    remindDate.setDate(remindDate.getDate() + 7);
                    remindDate.setHours(9, 0, 0, 0);
                    break;
            }
            await this.leadService.setReminder(leadId, remindDate, ctx.from.id);
            const dateStr = remindDate.toLocaleString('uz-UZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            await ctx.editMessageText(`✅ Eslatma belgilandi!\n📅 ${dateStr}`, {
                reply_markup: this.operatorKeyboard.getLeadStatusKeyboard(leadId).reply_markup
            });
        }
        catch (error) {
            console.error('SetReminder xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onCustomerInfo(ctx) {
        try {
            const leadId = parseInt(ctx.callbackQuery['data'].split('_')[1]);
            const lead = await this.leadService.findWithFullInfo(leadId);
            const message = `📊 <b>MIJOZ MA'LUMOTI</b>\n\n` +
                `🚗 <b>Avtomobil:</b> ${lead.car?.plateNumber}\n` +
                `👤 <b>Ega:</b> ${lead.car?.ownerName}\n` +
                `📞 <b>Asosiy tel:</b> <code>${phone_util_1.PhoneUtil.display(lead.car?.ownerPhone)}</code>\n` +
                `📞 <b>Ikkinchi tel:</b> <code>${phone_util_1.PhoneUtil.display(lead.car?.secondPhone) || 'Mavjud emas'}</code>\n` +
                `📅 <b>Sug'urta:</b> ${lead.insurance?.type || 'Standart'}\n` +
                `📆 <b>Tugash:</b> ${lead.insurance?.endDate ? new Date(lead.insurance.endDate).toLocaleDateString('uz-UZ') : '-'}\n` +
                `⏳ <b>Qolgan kun:</b> ${lead.daysRemaining} kun\n` +
                `🔥 <b>Lead turi:</b> ${lead.leadType}\n` +
                `📋 <b>Status:</b> ${this.getStatusText(lead.status)}\n` +
                `📞 <b>Qo'ng'iroqlar:</b> ${lead.callCount || 0} marta\n` +
                `📝 <b>Eslatmalar:</b> ${lead.notes ? lead.notes.split('\n').length : 0} ta\n` +
                `📊 <b>Lead yaratilgan:</b> ${new Date(lead.createdAt).toLocaleDateString('uz-UZ')}`;
            await ctx.editMessageText(message, {
                parse_mode: 'HTML',
                reply_markup: this.operatorKeyboard.getCustomerInfoKeyboard(leadId).reply_markup
            });
        }
        catch (error) {
            console.error('CustomerInfo xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onLeadHistory(ctx) {
        try {
            const leadId = parseInt(ctx.callbackQuery['data'].split('_')[1]);
            const history = await this.leadService.getLeadHistory(leadId);
            let message = `📊 <b>LEAD TARIXI</b>\n\n`;
            if (history.length === 0) {
                message += 'Hech qanday tarix mavjud emas.';
            }
            else {
                history.slice(0, 10).forEach((item, index) => {
                    const date = new Date(item.createdAt).toLocaleString('uz-UZ');
                    message += `${index + 1}. ${date}\n`;
                    message += `   📋 ${item.action}: ${item.description}\n`;
                    if (item.operator)
                        message += `   👤 Operator: ${item.operator}\n\n`;
                });
            }
            await ctx.editMessageText(message, {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('⬅️ Orqaga', `info_${leadId}`)]
                ]).reply_markup
            });
        }
        catch (error) {
            console.error('LeadHistory xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onSendSms(ctx) {
        try {
            const leadId = parseInt(ctx.callbackQuery['data'].split('_')[1]);
            const lead = await this.leadService.findById(leadId);
            ctx.session = {
                ...ctx.session,
                waitingFor: 'lead_sms',
                leadId: leadId
            };
            await ctx.editMessageText(`📨 <b>SMS YOZISH</b>\n\n` +
                `📞 Telefon: <code>${phone_util_1.PhoneUtil.display(lead.car?.ownerPhone)}</code>\n` +
                `👤 Mijoz: ${lead.car?.ownerName}`, { parse_mode: 'HTML' });
            await ctx.reply(`📝 SMS matnini kiriting:`, {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: [
                        ['❌ Bekor qilish']
                    ],
                    resize_keyboard: true
                }
            });
        }
        catch (error) {
            console.error('SendSms xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onTodayCalls(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const calls = await this.leadService.getTodayCalls(user.id);
            let message = '📞 <b>BUGUNGI QO\'NG\'IROQLAR</b>\n\n';
            if (calls.length === 0) {
                message += 'Bugun hali qo\'ng\'iroq qilmagansiz.';
            }
            else {
                calls.forEach((call, index) => {
                    const time = call.lastCallAt
                        ? new Date(call.lastCallAt).toLocaleTimeString('uz-UZ')
                        : 'Noma\'lum';
                    message += `${index + 1}. 🚗 ${call.car?.plateNumber} - ${call.car?.ownerName}\n`;
                    message += `   📞 ${phone_util_1.PhoneUtil.display(call.car?.ownerPhone)}\n`;
                    message += `   ⏰ ${time}\n`;
                    message += `   📊 ${call.callResult || 'Natija kiritilmagan'}\n\n`;
                });
            }
            await ctx.editMessageText(message, {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('⬅️ Orqaga', 'back_to_daily_plan')]
                ]).reply_markup
            });
        }
        catch (error) {
            console.error('TodayCalls xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onDailyStats(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            const stats = await this.leadService.getOperatorStats(user.id);
            const callStats = await this.leadService.getCallStats(user.id, 'day');
            const message = `📊 <b>KUNLIK STATISTIKA</b>\n\n` +
                `📅 Sana: ${new Date().toLocaleDateString('uz-UZ')}\n\n` +
                `📋 <b>LEADLAR:</b>\n` +
                `   • Jami: ${stats.today.all} ta\n` +
                `   • Yopilgan: ${stats.today.closed} ta\n` +
                `   • Qoldirilgan: ${stats.today.postponed} ta\n` +
                `   • Rad etilgan: ${stats.today.rejected} ta\n\n` +
                `📞 <b>QO'NG'IROQLAR:</b>\n` +
                `   • Jami: ${callStats.totalCalls} ta\n` +
                `   • Leadlar: ${callStats.totalLeads} ta\n` +
                `   • O'rtacha: ${callStats.avgCallsPerLead} ta/lead\n` +
                `   • Muvaffaqiyat: ${callStats.successRate.toFixed(1)}%`;
            await ctx.editMessageText(message, {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('⬅️ Orqaga', 'back_to_daily_plan')]
                ]).reply_markup
            });
        }
        catch (error) {
            console.error('DailyStats xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onBackToDailyPlan(ctx) {
        try {
            const user = await this.botService.findOrCreateUser(ctx.from);
            await this.onDailyPlan(ctx);
        }
        catch (error) {
            console.error('BackToDailyPlan xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onCarStatsCallback(ctx) {
        try {
            const stats = await this.carService.getCarStats();
            const message = `📊 <b>AVTOMOBIL STATISTIKASI</b>\n\n` +
                `🚗 Jami avtomobillar: ${stats.total} ta\n` +
                `✅ Aktiv sugʻurta: ${stats.active} ta\n` +
                `⚠️ 30 kunda tugaydigan: ${stats.expiring} ta\n` +
                `❌ Muddati oʻtgan: ${stats.expired} ta\n` +
                `📞 Ikkinchi telefonli: ${stats.withSecondPhone || 0} ta\n\n` +
                `📅 Bugun qoʻshilgan: ${stats.today} ta\n` +
                `📆 Shu oyda: ${stats.month} ta`;
            await ctx.editMessageText(message, {
                parse_mode: 'HTML',
                reply_markup: telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('⬅️ Orqaga', 'back_to_cars_list')]
                ]).reply_markup
            });
        }
        catch (error) {
            console.error('CarStats callback xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onExportCars(ctx) {
        try {
            await ctx.answerCbQuery('📥 Excel tayyorlanmoqda...');
            const cars = await this.carService.findAllWithInsurances();
            const filePath = await this.excelService.generateCarListReport(cars);
            await ctx.replyWithDocument({ source: filePath });
            setTimeout(() => {
                fs.unlink(filePath, (err) => {
                    if (err)
                        console.error('Faylni o\'chirishda xatolik:', err);
                });
            }, 5000);
        }
        catch (error) {
            console.error('Export cars error:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onBackToCarsList(ctx) {
        try {
            const cars = await this.carService.findAllWithInsurances();
            let message = '🚗 <b>BARChA AVTOMOBILLAR</b>\n\n';
            cars.slice(0, 10).forEach((car, index) => {
                const activeInsurance = car.insurances?.find(i => i.status === 'active');
                const endDate = activeInsurance
                    ? new Date(activeInsurance.endDate).toLocaleDateString('uz-UZ')
                    : 'Mavjud emas';
                message += `${index + 1}. <b>${car.plateNumber}</b>\n`;
                message += `   👤 Ega: ${car.ownerName}\n`;
                message += `   📞 Asosiy tel: ${phone_util_1.PhoneUtil.display(car.ownerPhone)}\n`;
                if (car.secondPhone) {
                    message += `   📞 Ikkinchi tel: ${phone_util_1.PhoneUtil.display(car.secondPhone)}\n`;
                }
                if (car.secondPlateNumber) {
                    message += `   ➕ Ikkinchi raqam: ${car.secondPlateNumber}\n`;
                }
                if (car.techPhoto || car.carPhoto) {
                    message += `   📸 Rasmlar mavjud\n`;
                }
                message += `   📅 Sugʻurta: ${endDate}\n`;
                message += `   🆔 ID: ${car.id}\n\n`;
            });
            if (cars.length > 10) {
                message += `... va yana ${cars.length - 10} ta avtomobil`;
            }
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [
                    telegraf_1.Markup.button.callback('📊 Statistika', 'car_stats'),
                    telegraf_1.Markup.button.callback('📥 Excel', 'export_cars')
                ]
            ]);
            await ctx.editMessageText(message, {
                parse_mode: 'HTML',
                reply_markup: keyboard.reply_markup
            });
        }
        catch (error) {
            console.error('Back to cars list error:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onDeleteAdminCallback(ctx) {
        try {
            const telegramId = ctx.callbackQuery['data'].split('_')[2];
            const user = await this.userService.findByTelegramId(telegramId);
            if (!user) {
                await ctx.answerCbQuery('❌ Foydalanuvchi topilmadi');
                await ctx.deleteMessage();
                return;
            }
            const adminCount = await this.userService.getCountByRole('admin');
            if (adminCount <= 1 && user.role === 'admin') {
                await ctx.answerCbQuery('❌ Kamida 1 ta admin bo\'lishi kerak!');
                return;
            }
            await this.userService.updateRole(user.id, 'registrar');
            await this.userService.notifyAdminsAboutRoleChange(user, 'admin', 'registrar', ctx.from.username);
            await ctx.answerCbQuery('✅ Admin o\'chirildi');
            await ctx.editMessageText(`✅ ${user.firstName || user.username} adminlikdan olib tashlandi.`);
        }
        catch (error) {
            console.error('DeleteAdminCallback xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onDeleteOperatorCallback(ctx) {
        try {
            const telegramId = ctx.callbackQuery['data'].split('_')[2];
            const user = await this.userService.findByTelegramId(telegramId);
            if (!user) {
                await ctx.answerCbQuery('❌ Foydalanuvchi topilmadi');
                await ctx.deleteMessage();
                return;
            }
            await this.userService.updateRole(user.id, 'registrar');
            await this.userService.notifyAdminsAboutRoleChange(user, 'operator', 'registrar', ctx.from.username);
            await ctx.answerCbQuery('✅ Operator o\'chirildi');
            await ctx.editMessageText(`✅ ${user.firstName || user.username} operatorlikdan olib tashlandi.`);
        }
        catch (error) {
            console.error('DeleteOperatorCallback xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onBack(ctx) {
        try {
            console.log('⬅️ Orqaga tugmasi bosildi, currentMenu:', ctx.session?.currentMenu);
            const user = await this.botService.findOrCreateUser(ctx.from);
            if (ctx.scene?.current) {
                await ctx.scene.leave();
            }
            if (!ctx.session)
                ctx.session = { currentMenu: 'main', waitingFor: null };
            const currentMenu = ctx.session.currentMenu || 'main';
            if (currentMenu === 'admin') {
                ctx.session.currentMenu = 'main';
                await ctx.reply('🏠 Asosiy menyu', this.mainKeyboard.getMainKeyboard(user.role));
            }
            else if (currentMenu === 'operator_leads' || currentMenu === 'moderation') {
                ctx.session.currentMenu = 'main';
                await ctx.reply('🏠 Asosiy menyu', this.mainKeyboard.getMainKeyboard(user.role));
            }
            else if (['leads', 'stats', 'users', 'cars', 'insurances', 'finance', 'reports', 'settings'].includes(currentMenu)) {
                ctx.session.currentMenu = 'admin';
                await ctx.reply('👑 Admin panel', this.adminKeyboard.getAdminMainKeyboard());
            }
            else {
                ctx.session.currentMenu = 'main';
                await ctx.reply('🏠 Asosiy menyu', this.mainKeyboard.getMainKeyboard(user.role));
            }
        }
        catch (error) {
            console.error('Back xatosi:', error);
            await ctx.reply('❌ Orqaga qaytishda xatolik yuz berdi.');
        }
    }
    async onCancel(ctx) {
        try {
            if (ctx.scene)
                await ctx.scene.leave();
            ctx.session = {
                ...ctx.session,
                waitingFor: null
            };
            const user = await this.botService.findOrCreateUser(ctx.from);
            await ctx.reply('❌ Amal bekor qilindi', this.mainKeyboard.getMainKeyboard(user.role));
        }
        catch (error) {
            console.error('Cancel xatosi:', error);
            await ctx.reply('❌ Bekor qilishda xatolik yuz berdi.');
        }
    }
    async onText(ctx) {
        try {
            if (!ctx.message || !('text' in ctx.message)) {
                return;
            }
            const text = ctx.message.text;
            if (!ctx.session?.waitingFor)
                return;
            if (ctx.session.waitingFor === 'search_car') {
                const query = text;
                ctx.session.waitingFor = null;
                const cars = await this.carService.searchCars(query);
                if (!cars || cars.length === 0) {
                    await ctx.reply('🔍 Hech qanday avtomobil topilmadi.');
                    return;
                }
                let message = `🔍 <b>QIDIRUV NATIJALARI: "${query}"</b>\n\n`;
                cars.slice(0, 10).forEach((car, index) => {
                    const activeInsurance = car.insurances?.find(i => i.status === 'active');
                    const endDate = activeInsurance
                        ? new Date(activeInsurance.endDate).toLocaleDateString('uz-UZ')
                        : 'Mavjud emas';
                    message += `${index + 1}. <b>${car.plateNumber}</b>\n`;
                    message += `   👤 Ega: ${car.ownerName}\n`;
                    message += `   📞 Asosiy tel: ${phone_util_1.PhoneUtil.display(car.ownerPhone)}\n`;
                    if (car.secondPhone) {
                        message += `   📞 Ikkinchi tel: ${phone_util_1.PhoneUtil.display(car.secondPhone)}\n`;
                    }
                    if (car.secondPlateNumber) {
                        message += `   ➕ Ikkinchi raqam: ${car.secondPlateNumber}\n`;
                    }
                    if (car.techPhoto || car.carPhoto) {
                        message += `   📸 Rasmlar: `;
                        if (car.techPhoto)
                            message += `[Tex pasport] `;
                        if (car.carPhoto)
                            message += `[Mashina] `;
                        message += `\n`;
                    }
                    message += `   📅 Sugʻurta: ${endDate}\n`;
                    message += `   🆔 ID: ${car.id}\n\n`;
                });
                if (cars.length > 10) {
                    message += `... va yana ${cars.length - 10} ta avtomobil`;
                }
                await ctx.replyWithHTML(message);
                return;
            }
            if (ctx.session.waitingFor === 'lead_note') {
                const leadId = ctx.session.leadId;
                const note = text;
                await this.leadService.addNote(leadId, note, ctx.from.id);
                ctx.session.waitingFor = null;
                ctx.session.leadId = null;
                await ctx.reply('✅ Eslatma qo\'shildi!');
                const lead = await this.leadService.findById(leadId);
                await ctx.reply(`📞 ${lead.car?.plateNumber} uchun amal:`, this.operatorKeyboard.getLeadStatusKeyboard(leadId));
                return;
            }
            if (ctx.session.waitingFor === 'lead_sms') {
                const leadId = ctx.session.leadId;
                const smsText = text;
                const lead = await this.leadService.findById(leadId);
                await this.leadService.logSms(leadId, smsText, ctx.from.id);
                ctx.session.waitingFor = null;
                ctx.session.leadId = null;
                await ctx.reply('✅ SMS yuborildi!');
                await ctx.reply(`📞 ${lead.car?.plateNumber} uchun amal:`, this.operatorKeyboard.getLeadStatusKeyboard(leadId));
                return;
            }
            if (ctx.session.waitingFor === 'admin_add') {
                const telegramId = text.trim();
                if (!/^\d+$/.test(telegramId)) {
                    await ctx.reply('❌ Noto\'g\'ri format. Faqat raqam kiriting!');
                    return;
                }
                const user = await this.userService.findByTelegramId(telegramId);
                if (!user) {
                    await ctx.reply('❌ Bu Telegram ID li foydalanuvchi topilmadi.\n' +
                        'Foydalanuvchi avval botga /start yozishi kerak!');
                    ctx.session.waitingFor = null;
                    return;
                }
                const oldRole = user.role;
                if (user.role === 'admin') {
                    await ctx.reply('ℹ️ Bu foydalanuvchi allaqachon admin!');
                }
                else {
                    await this.userService.updateRole(user.id, 'admin');
                    await this.botService.sendMessage(telegramId, `👑 <b>SIZ ADMIN QILINDINGIZ!</b>\n\n` +
                        `Endi siz barcha ma'lumotlarni boshqarishingiz mumkin.\n` +
                        `📊 Admin panelni ko'rish uchun /start ni bosing.`);
                    await this.userService.notifyAdminsAboutNewAdmin(user, oldRole, ctx.from.username);
                    await ctx.reply(`✅ ${user.firstName || user.username} muvaffaqiyatli admin qilindi!\n\n` +
                        `📢 Barcha adminlarga xabar yuborildi.`);
                }
                ctx.session.waitingFor = null;
                return;
            }
            if (ctx.session.waitingFor === 'operator_add') {
                const telegramId = text.trim();
                if (!/^\d+$/.test(telegramId)) {
                    await ctx.reply('❌ Noto\'g\'ri format. Faqat raqam kiriting!');
                    return;
                }
                const user = await this.userService.findByTelegramId(telegramId);
                if (!user) {
                    await ctx.reply('❌ Bu Telegram ID li foydalanuvchi topilmadi.\n' +
                        'Foydalanuvchi avval botga /start yozishi kerak!');
                    ctx.session.waitingFor = null;
                    return;
                }
                const oldRole = user.role;
                if (user.role === 'operator') {
                    await ctx.reply('ℹ️ Bu foydalanuvchi allaqachon operator!');
                }
                else {
                    await this.userService.updateRole(user.id, 'operator');
                    await this.botService.sendMessage(telegramId, `🎉 <b>SIZ OPERATOR QILINDINGIZ!</b>\n\n` +
                        `Endi siz leadlar bilan ishlashingiz mumkin.\n` +
                        `📋 Leadlarni ko'rish uchun /start ni bosing.`);
                    await this.userService.notifyAdminsAboutNewOperator(user, oldRole, ctx.from.username);
                    await ctx.reply(`✅ ${user.firstName || user.username} muvaffaqiyatli operator qilindi!\n\n` +
                        `📢 Barcha adminlarga xabar yuborildi.`);
                }
                ctx.session.waitingFor = null;
                return;
            }
            if (ctx.session.waitingFor === 'moderation_reject_custom_reason') {
                const moderationId = ctx.session.moderationId;
                const reasonText = text;
                if (reasonText === '❌ Bekor qilish') {
                    ctx.session.waitingFor = null;
                    ctx.session.moderationId = null;
                    const user = await this.botService.findOrCreateUser(ctx.from);
                    await ctx.reply('❌ Bekor qilindi', this.mainKeyboard.getMainKeyboard(user.role));
                    return;
                }
                const operator = await this.botService.findOrCreateUser(ctx.from);
                const result = await this.moderationService.reject(moderationId, operator.id, { field: 'other', message: reasonText, details: reasonText });
                if (result.success) {
                    await ctx.reply('❌ Avtomobil rad etildi!');
                    await this.moderationService.notifyRejection(moderationId, { field: 'other', message: reasonText });
                }
                else {
                    await ctx.reply(`❌ ${result.message}`);
                }
                const user = await this.botService.findOrCreateUser(ctx.from);
                await ctx.reply('🏠 Asosiy menyu', this.mainKeyboard.getMainKeyboard(user.role));
                ctx.session.waitingFor = null;
                ctx.session.moderationId = null;
                return;
            }
            if (ctx.session.waitingFor === 'role_change') {
                const parts = text.split(' ');
                if (parts.length !== 2) {
                    await ctx.reply('❌ Noto\'g\'ri format. Masalan: <code>123456789 operator</code>');
                    return;
                }
                const [telegramId, newRole] = parts;
                if (!/^\d+$/.test(telegramId)) {
                    await ctx.reply('❌ Noto\'g\'ri Telegram ID format!');
                    return;
                }
                if (!['registrar', 'operator', 'admin'].includes(newRole)) {
                    await ctx.reply('❌ Noto\'g\'ri rol! Registrar, operator yoki admin bo\'lishi kerak.');
                    return;
                }
                const user = await this.userService.findByTelegramId(telegramId);
                if (!user) {
                    await ctx.reply('❌ Bu Telegram ID li foydalanuvchi topilmadi.\n' +
                        'Foydalanuvchi avval botga /start yozishi kerak!');
                    ctx.session.waitingFor = null;
                    return;
                }
                const oldRole = user.role;
                if (oldRole === newRole) {
                    await ctx.reply(`ℹ️ Bu foydalanuvchi allaqachon ${newRole}!`);
                }
                else {
                    await this.userService.updateRole(user.id, newRole);
                    const roleIcons = { admin: '👑', operator: '🎮', registrar: '📋' };
                    await this.botService.sendMessage(telegramId, `🔄 <b>ROLINGIZ O'ZGARTIRILDI!</b>\n\n` +
                        `Eski rol: ${roleIcons[oldRole]} ${oldRole}\n` +
                        `Yangi rol: ${roleIcons[newRole]} <b>${newRole}</b>\n\n` +
                        `Yangi rolingiz bilan ishlash uchun /start ni bosing.`);
                    await this.userService.notifyAdminsAboutRoleChange(user, oldRole, newRole, ctx.from.username);
                    await ctx.reply(`✅ ${user.firstName || user.username} roli ${newRole} ga oʻzgartirildi!\n\n` +
                        `📢 Barcha adminlarga xabar yuborildi.`);
                }
                ctx.session.waitingFor = null;
                return;
            }
        }
        catch (error) {
            console.error('Text handler xatosi:', error);
        }
    }
    async onModerationApprove(ctx) {
        try {
            const callbackData = ctx.callbackQuery['data'];
            const parts = callbackData.split('_');
            const moderationId = parts.slice(2).join('_');
            console.log('🔍 Tasdiqlash so\'rovi:', { callbackData, moderationId });
            const operator = await this.botService.findOrCreateUser(ctx.from);
            await ctx.answerCbQuery('⏳ Tasdiqlanmoqda...');
            const result = await this.moderationService.approve(moderationId, operator.id);
            if (!result.success) {
                await ctx.answerCbQuery(`❌ ${result.message}`);
                await ctx.editMessageText(`❌ ${result.message}`);
                return;
            }
            await ctx.answerCbQuery('✅ Tasdiqlandi');
            await ctx.editMessageText(`━━━━━━━━━━━━━━━━━━\n` +
                `✅ <b>AVTOMOBIL TASDIQLANDI!</b>\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `🚗 Avtomobil: <b>${result.car?.plateNumber}</b>\n` +
                `👤 Ega: <b>${result.car?.ownerName}</b>\n` +
                `📞 Tel: <code>${phone_util_1.PhoneUtil.display(result.car?.ownerPhone)}</code>\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `👤 Operator: <b>${operator.firstName || operator.username}</b>\n` +
                `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`, { parse_mode: 'HTML' });
            await this.moderationService.notifyApproval(moderationId, result.car);
        }
        catch (error) {
            console.error('ModerationApprove xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onModerationReject(ctx) {
        try {
            const callbackData = ctx.callbackQuery['data'];
            const parts = callbackData.split('_');
            const moderationId = parts.slice(2).join('_');
            ctx.session = {
                ...ctx.session,
                waitingFor: 'moderation_reject_reason',
                moderationId: moderationId
            };
            await ctx.editMessageText(`❌ Rad etish sababini tanlang:`, {
                reply_markup: {
                    inline_keyboard: [
                        [telegraf_1.Markup.button.callback('🚗 Avtomobil raqami xato', 'reject_reason_plate')],
                        [telegraf_1.Markup.button.callback('📸 Rasm aniq emas', 'reject_reason_photo')],
                        [telegraf_1.Markup.button.callback('📄 Tex pasport xato', 'reject_reason_doc')],
                        [telegraf_1.Markup.button.callback('🚘 Mashina mos kelmadi', 'reject_reason_car')],
                        [telegraf_1.Markup.button.callback('✏️ Boshqa sabab', 'reject_reason_other')],
                        [telegraf_1.Markup.button.callback('⬅️ Orqaga', `mod_back_${moderationId}`)]
                    ]
                }
            });
        }
        catch (error) {
            console.error('ModerationReject xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onRejectReason(ctx) {
        try {
            const reasonType = ctx.callbackQuery['data'].split('_')[2];
            const moderationId = ctx.session?.moderationId;
            if (!moderationId) {
                await ctx.answerCbQuery('❌ Moderatsiya topilmadi');
                return;
            }
            const reasons = {
                'plate': { field: 'plateNumber', message: 'Avtomobil raqami xato' },
                'photo': { field: 'photo', message: 'Rasm aniq emas', details: 'Rasm loyqa yoki raqam koʻrinmayapti' },
                'doc': { field: 'document', message: 'Tex pasport xato', details: 'Tex pasport rasmi oʻqilmayapti' },
                'car': { field: 'car', message: 'Mashina mos kelmadi', details: 'Boshqa avtomobil rasmi yuborilgan' },
                'other': { field: 'other', message: 'Boshqa sabab' }
            };
            if (reasonType === 'other') {
                ctx.session.waitingFor = 'moderation_reject_custom_reason';
                ctx.session.moderationId = moderationId;
                await ctx.editMessageText(`✏️ Rad etish sababini yozing:`, {
                    reply_markup: {
                        inline_keyboard: [
                            [telegraf_1.Markup.button.callback('❌ Bekor qilish', 'cancel_moderation')]
                        ]
                    }
                });
                await ctx.reply(`✏️ Rad etish sababini yozing:`, {
                    reply_markup: {
                        keyboard: [
                            ['❌ Bekor qilish']
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                });
                return;
            }
            const operator = await this.botService.findOrCreateUser(ctx.from);
            const reason = reasons[reasonType] || { field: 'other', message: 'Boshqa sabab' };
            const result = await this.moderationService.reject(moderationId, operator.id, reason);
            if (!result.success) {
                await ctx.answerCbQuery(`❌ ${result.message}`);
                return;
            }
            await ctx.answerCbQuery('❌ Rad etildi');
            await ctx.editMessageText(`━━━━━━━━━━━━━━━━━━\n` +
                `❌ <b>AVTOMOBIL RAD ETILDI!</b>\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📋 Sabab: ${reason.message}\n` +
                `${reason.details ? `📝 Tafsilot: ${reason.details}\n` : ''}` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`, { parse_mode: 'HTML' });
            await this.moderationService.notifyRejection(moderationId, reason);
            const user = await this.botService.findOrCreateUser(ctx.from);
            await ctx.reply('🏠 Asosiy menyu', this.mainKeyboard.getMainKeyboard(user.role));
            ctx.session.waitingFor = null;
            ctx.session.moderationId = null;
        }
        catch (error) {
            console.error('RejectReason xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onCancelModeration(ctx) {
        ctx.session.waitingFor = null;
        ctx.session.moderationId = null;
        await ctx.editMessageText('❌ Bekor qilindi');
        const user = await this.botService.findOrCreateUser(ctx.from);
        await ctx.reply('🏠 Asosiy menyu', this.mainKeyboard.getMainKeyboard(user.role));
    }
    async onModerationPhotos(ctx) {
        try {
            const callbackData = ctx.callbackQuery['data'];
            const parts = callbackData.split('_');
            const moderationId = parts.slice(2).join('_');
            console.log('📸 Rasm so\'rovi:', { moderationId });
            const moderation = await this.moderationService.get(moderationId);
            if (!moderation) {
                await ctx.answerCbQuery('❌ Moderatsiya topilmadi');
                return;
            }
            const data = moderation.data;
            await ctx.answerCbQuery('📸 Rasmlar yuborilmoqda...');
            await ctx.editMessageText(`📸 <b>RASMLAR YUBORILMOQDA</b>\n\n` +
                `🚗 Avtomobil: <b>${data.plateNumber}</b>\n` +
                `👤 Ega: ${data.ownerName}\n\n` +
                `Iltimos, kuting...`, { parse_mode: 'HTML' });
            console.log('📸 Tech photo path:', data.techPhoto);
            console.log('📸 Car photo path:', data.carPhoto);
            let sentCount = 0;
            const errors = [];
            if (data.techPhoto) {
                try {
                    const techPhotoUrl = this.getFullUrl(data.techPhoto);
                    console.log('📸 Tex pasport old tomon URL:', techPhotoUrl);
                    if (techPhotoUrl) {
                        await ctx.replyWithPhoto(techPhotoUrl, {
                            caption: `📸 <b>Tex pasport old tomoni</b>\n🚗 ${data.plateNumber}`,
                            parse_mode: 'HTML'
                        });
                        sentCount++;
                    }
                    else {
                        errors.push('Tex pasport old tomon URL yaroqsiz');
                    }
                }
                catch (error) {
                    console.error('❌ Tex pasport old tomon xatosi:', error);
                    errors.push(`Tex pasport old: ${error.message}`);
                }
            }
            else {
                errors.push('Tex pasport old tomon rasmi mavjud emas');
            }
            if (data.techBackPhoto) {
                try {
                    const techBackPhotoUrl = this.getFullUrl(data.techBackPhoto);
                    console.log('📸 Tex pasport orqa tomon URL:', techBackPhotoUrl);
                    if (techBackPhotoUrl) {
                        await ctx.replyWithPhoto(techBackPhotoUrl, {
                            caption: `📸 <b>Tex pasport orqa tomoni (seriyali)</b>\n🚗 ${data.plateNumber}`,
                            parse_mode: 'HTML'
                        });
                        sentCount++;
                    }
                    else {
                        errors.push('Tex pasport orqa tomon URL yaroqsiz');
                    }
                }
                catch (error) {
                    console.error('❌ Tex pasport orqa tomon xatosi:', error);
                    errors.push(`Tex pasport orqa: ${error.message}`);
                }
            }
            else {
                errors.push('Tex pasport orqa tomon rasmi mavjud emas');
            }
            if (data.carPhoto) {
                try {
                    const carPhotoUrl = this.getFullUrl(data.carPhoto);
                    console.log('📸 Mashina URL:', carPhotoUrl);
                    if (carPhotoUrl) {
                        await ctx.replyWithPhoto(carPhotoUrl, {
                            caption: `📸 <b>Mashina rasmi</b>\n🚗 ${data.plateNumber}`,
                            parse_mode: 'HTML'
                        });
                        sentCount++;
                    }
                    else {
                        errors.push('Mashina URL yaroqsiz');
                    }
                }
                catch (error) {
                    console.error('❌ Mashina xatosi:', error);
                    errors.push(`Mashina: ${error.message}`);
                }
            }
            else {
                errors.push('Mashina rasmi mavjud emas');
            }
            if (sentCount > 0) {
                let resultMessage = `✅ <b>${sentCount} ta rasm yuborildi</b>\n\n🚗 ${data.plateNumber}`;
                if (errors.length > 0) {
                    resultMessage += `\n\n⚠️ Xatoliklar:\n${errors.join('\n')}`;
                }
                await ctx.reply(resultMessage, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [telegraf_1.Markup.button.callback('⬅️ Orqaga', `mod_back_${moderationId}`)]
                        ]
                    }
                });
            }
            else {
                await ctx.reply(`❌ <b>Rasmlar yuborilmadi</b>\n\nXatoliklar:\n${errors.join('\n')}`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [telegraf_1.Markup.button.callback('⬅️ Orqaga', `mod_back_${moderationId}`)]
                        ]
                    }
                });
            }
        }
        catch (error) {
            console.error('❌ ModerationPhotos xatosi:', error);
            await ctx.reply(`❌ Xatolik: ${error.message}`);
        }
    }
    getFullUrl(relativePath) {
        if (!relativePath) {
            console.log('⚠️ Rasm yo\'li bo\'sh');
            return null;
        }
        if (relativePath.startsWith('http')) {
            console.log('✅ To\'liq URL:', relativePath);
            return relativePath;
        }
        const baseUrl = this.configService.get('APP_URL', 'http://localhost:4000');
        console.log('🏠 Base URL:', baseUrl);
        let path = relativePath;
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        path = path.replace(/\\/g, '/');
        const fullUrl = `${baseUrl}${path}`;
        console.log('🔗 Generated URL:', fullUrl);
        return fullUrl;
    }
    async onModerationDetails(ctx) {
        try {
            const callbackData = ctx.callbackQuery['data'];
            const parts = callbackData.split('_');
            const moderationId = parts.slice(2).join('_');
            const moderation = await this.moderationService.get(moderationId);
            if (!moderation) {
                await ctx.answerCbQuery('❌ Moderatsiya topilmadi');
                return;
            }
            const data = moderation.data;
            const secondPhoneText = data.secondPhone
                ? `📞 Ikkinchi telefon: <code>${phone_util_1.PhoneUtil.display(data.secondPhone)}</code>\n`
                : '';
            const startDate = new Date(data.startDate).toLocaleDateString('uz-UZ');
            const endDate = new Date(data.endDate).toLocaleDateString('uz-UZ');
            const submittedDate = new Date(data.submittedAt).toLocaleString('uz-UZ');
            const insuranceTypeText = {
                '24days': '24 kunlik',
                '6months': '6 oylik',
                '1year': '1 yillik'
            }[data.insuranceType] || data.insuranceType;
            const notifiedCount = moderation.notifiedOperators?.length || 0;
            const timeLeft = Math.round((moderation.expiresAt - Date.now()) / (60 * 60 * 1000));
            const message = `━━━━━━━━━━━━━━━━━━\n` +
                `📋 <b>MODERATSIYA BATAFSIL</b>\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `🆔 ID: <code>${moderationId}</code>\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `🚗 <b>Avtomobil:</b> ${data.plateNumber}\n` +
                `👤 <b>Ega:</b> ${data.ownerName}\n` +
                `📞 <b>Asosiy tel:</b> <code>${phone_util_1.PhoneUtil.display(data.ownerPhone)}</code>\n` +
                `${secondPhoneText}` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📅 <b>Sug'urta:</b> ${insuranceTypeText}\n` +
                `📆 <b>Boshlanishi:</b> ${startDate}\n` +
                `📆 <b>Tugashi:</b> ${endDate}\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `👤 <b>Registrar:</b> ${data.registrarName}\n` +
                `📅 <b>Yuborilgan:</b> ${submittedDate}\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📊 <b>Holat:</b> ${moderation.status === 'pending' ? '⏳ Kutilmoqda' : moderation.status === 'approved' ? '✅ Tasdiqlangan' : '❌ Rad etilgan'}\n` +
                `👥 <b>Xabar yuborilgan:</b> ${notifiedCount} ta operatorga\n` +
                `⏰ <b>Muddat:</b> ${timeLeft > 0 ? timeLeft + ' soat qoldi' : '❌ Muddati o\'tgan'}`;
            await ctx.editMessageText(message, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            telegraf_1.Markup.button.callback('⬅️ Orqaga', `mod_back_${moderationId}`)
                        ]
                    ]
                }
            });
        }
        catch (error) {
            console.error('ModerationDetails xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async onModerationBack(ctx) {
        try {
            const callbackData = ctx.callbackQuery['data'];
            const parts = callbackData.split('_');
            const moderationId = parts.slice(2).join('_');
            const moderation = await this.moderationService.get(moderationId);
            if (!moderation) {
                await ctx.answerCbQuery('❌ Moderatsiya topilmadi');
                return;
            }
            await this.sendModerationMessage(ctx, moderation);
        }
        catch (error) {
            console.error('ModerationBack xatosi:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async sendModerationMessage(ctx, moderation) {
        const data = moderation.data;
        const moderationId = moderation.id;
        const secondPhoneText = data.secondPhone
            ? `📞 Ikkinchi telefon: <code>${phone_util_1.PhoneUtil.display(data.secondPhone)}</code>\n`
            : '';
        const message = `━━━━━━━━━━━━━━━━━━\n` +
            `🔄 <b>YANGI AVTOMOBIL MODERATSIYASI</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `📋 <b>MA'LUMOTLAR:</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `🚗 Avtomobil raqami: <b>${data.plateNumber}</b>\n` +
            `👤 Avtomobil egasi: <b>${data.ownerName}</b>\n` +
            `📞 Asosiy telefon: <code>${phone_util_1.PhoneUtil.display(data.ownerPhone)}</code>\n` +
            `${secondPhoneText}` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `📅 Sug'urta turi: <b>${data.insuranceType}</b>\n` +
            `📆 Boshlanishi: ${new Date(data.startDate).toLocaleDateString('uz-UZ')}\n` +
            `📆 Tugashi: ${new Date(data.endDate).toLocaleDateString('uz-UZ')}\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `👤 Registrar: ${data.registrarName}\n` +
            `📅 Sana: ${new Date(data.submittedAt).toLocaleString('uz-UZ')}\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `Tasdiqlaysizmi?`;
        await ctx.replyWithHTML(message, {
            reply_markup: {
                inline_keyboard: [
                    [
                        telegraf_1.Markup.button.callback('✅ Tasdiqlash', `mod_approve_${moderationId}`),
                        telegraf_1.Markup.button.callback('❌ Rad etish', `mod_reject_${moderationId}`)
                    ],
                    [
                        telegraf_1.Markup.button.callback('📸 Rasmlarni koʻrish', `mod_photos_${moderationId}`),
                        telegraf_1.Markup.button.callback('📋 Batafsil', `mod_details_${moderationId}`)
                    ]
                ]
            }
        });
    }
    getStatusText(status) {
        const statusMap = {
            'new': '🆕 Yangi',
            'inProgress': '🔄 Jarayonda',
            'closed': '✅ Yopilgan',
            'rejected': '✖ Rad etilgan',
            'postponed': '⏳ Keyinga qoldirilgan'
        };
        return statusMap[status] || status;
    }
    getCallResultText(status) {
        const results = {
            'closed': '✅ Muvaffaqiyatli',
            'rejected': '✖ Rad etilgan',
            'postponed': '⏳ Keyinga qoldirilgan',
            'new': '🆕 Yangi',
            'inProgress': '🔄 Jarayonda'
        };
        return results[status] || status;
    }
};
exports.BotUpdate = BotUpdate;
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onStart", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📄 Qoidalar'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onRules", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📞 Yordam'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onHelp", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🚗 Avtomobil qo\'shish'),
    (0, common_1.UseGuards)(registrar_guard_1.RegistrarGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAddCar", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🏠 Mening natijam'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onMyStats", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🔄 Moderatsiya'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onModeration", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('⏳ Kutilayotganlar'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onPendingModerations", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📋 Menga yuborilganlar'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onMyModerations", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 Moderatsiya statistikasi'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onModerationStats", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📋 Leadlar'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onLeads", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🔥 HOT leadlar'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onHotLeads", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🌤 WARM leadlar'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onWarmLeads", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('❄️ COLD leadlar'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onColdLeads", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('✅ Yopilganlar'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onClosedLeads", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 Mening statistikam'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onOperatorStats", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📞 Qo\'ng\'iroqlar tarixi'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onCallHistory", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📅 Bugungi rejalar'),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onDailyPlan", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('👑 Admin panel'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAdminPanel", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 Statistika'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onStats", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 Bugun'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onTodayStats", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📆 Shu oy'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onMonthStats", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📈 Yillik'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onYearStats", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🏆 Reyting'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onRating", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📉 Lead statistikasi'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onLeadStats", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 KPI statistikasi'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onKpiStats", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('👥 Foydalanuvchilar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onUsers", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('👑 Adminlar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAdminsList", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🎮 Operatorlar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onOperatorsList", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📋 Registratorlar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onRegistrarsList", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('👥 Barcha userlar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAllUsers", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('➕ Operator qo\'shish'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAddOperator", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('✖️ Operator o\'chirish'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onDeleteOperator", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('👑 Admin qo\'shish'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAddAdmin", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('✖️ Admin o\'chirish'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onDeleteAdmin", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📋 Rol o\'zgartirish'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onChangeRole", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🚗 Avtomobillar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onCars", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🚗 Barcha avtomobillar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAllCars", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('➕ Avtomobil qo\'shish'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAddCarAdmin", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🔍 Avtomobil qidirish'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onSearchCar", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📋 Sug\'urta muddati tugaydiganlar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onExpiringCars", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('❌ Muddati o\'tganlar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onExpiredCars", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 Avtomobil statistikasi'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onCarStats", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📋 Leadlar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAdminLeads", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 Lead hisobot'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onLeadReport", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📤 Lead taqsimlash'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAssignLeads", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('💰 Moliya'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onFinance", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('💰 To\'lovlar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onPayments", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('💳 KPI hisoblash'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onCalculateKpi", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 Oylik moliya'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onMonthlyFinance", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📈 Daromad'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onIncome", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 Hisobotlar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onReports", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📥 Excel export'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onExcelExport", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 Operator hisoboti'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onOperatorReport", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📋 Lead hisoboti'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onLeadReportFull", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🚗 Avtomobil hisoboti'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onCarReport", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('💰 Moliya hisoboti'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onFinanceReport", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 Sug\'urta hisoboti'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onInsuranceReport", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('⚙️ Sozlamalar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onSettings", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('⚙️ KPI sozlamalari'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onKpiSettings", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🔔 Bildirishnomalar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onNotifications", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🕒 Ish vaqti'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onWorkTime", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('💾 Backup'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onBackup", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🚙 Sug\'urtalar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onInsurances", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📋 Aktiv sug\'urtalar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onActiveInsurances", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('❌ Muddati o\'tganlar'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onExpiredInsurances", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('📊 Sug\'urta statistikasi'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onInsuranceStats", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^close_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onLeadClose", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^later_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onLeadLater", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^reject_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onLeadReject", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^call_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onLeadCall", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^recall_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onRecall", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^note_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onAddNote", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^remind_(\w+)_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onSetReminder", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^info_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onCustomerInfo", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^history_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onLeadHistory", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^sms_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onSendSms", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('today_calls'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onTodayCalls", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('daily_stats'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onDailyStats", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_daily_plan'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onBackToDailyPlan", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('car_stats'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onCarStatsCallback", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('export_cars'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onExportCars", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_cars_list'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onBackToCarsList", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^delete_admin_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onDeleteAdminCallback", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^delete_operator_(\d+)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onDeleteOperatorCallback", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('⬅️ Orqaga'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onBack", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('❌ Bekor qilish'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onCancel", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onText", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^mod_approve_(.+)$/),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onModerationApprove", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^mod_reject_(.+)$/),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onModerationReject", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^reject_reason_(.+)$/),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onRejectReason", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('cancel_moderation'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onCancelModeration", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^mod_photos_(.+)$/),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onModerationPhotos", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^mod_details_(.+)$/),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onModerationDetails", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^mod_back_(.+)$/),
    (0, common_1.UseGuards)(operator_guard_1.OperatorGuard),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotUpdate.prototype, "onModerationBack", null);
exports.BotUpdate = BotUpdate = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [bot_service_1.BotService,
        main_keyboard_1.MainKeyboard,
        admin_keyboard_1.AdminKeyboard,
        operator_keyboard_1.OperatorKeyboard,
        lead_service_1.LeadService,
        user_service_1.UserService,
        car_service_1.CarService,
        kpi_service_1.KpiService,
        insurance_service_1.InsuranceService,
        moderation_service_1.ModerationService,
        exel_service_1.ExcelService,
        config_1.ConfigService])
], BotUpdate);
//# sourceMappingURL=bot.update.js.map
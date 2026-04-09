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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCarScene = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const car_entity_1 = require("../../../database/entities/car.entity");
const insurance_entity_1 = require("../../../database/entities/insurance.entity");
const user_entity_1 = require("../../../database/entities/user.entity");
const bot_service_1 = require("../bot.service");
const moderation_service_1 = require("../../moderation/moderation.service");
const phone_util_1 = require("../../../common/utils/phone.util");
const kpi_constants_1 = require("../../../common/constants/kpi.constants");
const main_keyboard_1 = require("../keyboards/main.keyboard");
const telegraf_1 = require("telegraf");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
let AddCarScene = class AddCarScene {
    constructor(carRepo, insuranceRepo, userRepo, botService, moderationService, mainKeyboard) {
        this.carRepo = carRepo;
        this.insuranceRepo = insuranceRepo;
        this.userRepo = userRepo;
        this.botService = botService;
        this.moderationService = moderationService;
        this.mainKeyboard = mainKeyboard;
        this.tempData = new Map();
    }
    async onEnter(ctx) {
        const userId = ctx.from?.id;
        if (!userId) {
            await ctx.reply('❌ Foydalanuvchi topilmadi!');
            await this.returnToMainMenu(ctx);
            return;
        }
        this.tempData.set(userId, { step: 1, phoneErrorCount: 0 });
        await ctx.reply('1️⃣ Avtomobil raqamini kiriting:\nMasalan: <code>01A123BB</code>', {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    ['❌ Bekor qilish']
                ],
                resize_keyboard: true
            }
        });
    }
    async onText(ctx) {
        const userId = ctx.from?.id;
        if (!userId)
            return;
        const data = this.tempData.get(userId);
        if (!data) {
            await ctx.reply('❌ Xatolik yuz berdi. Qaytadan boshlang.');
            await this.returnToMainMenu(ctx);
            return;
        }
        const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
        if (text === '❌ Bekor qilish') {
            await ctx.reply('❌ Amal bekor qilindi');
            await this.returnToMainMenu(ctx);
            return;
        }
        try {
            if (data.step === 1) {
                const plateRegex = /^[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{2}$/i;
                if (!plateRegex.test(text.trim())) {
                    await ctx.reply('❌ Noto\'g\'ri format!\nTo\'g\'ri format: <code>01A123BB</code>', { parse_mode: 'HTML' });
                    return;
                }
                const plateNumber = text.trim().toUpperCase();
                const existing = await this.carRepo.findOne({
                    where: { plateNumber }
                });
                if (existing) {
                    await ctx.reply('❌ Bu avtomobil raqami avval ro\'yxatga olingan!');
                    return;
                }
                data.plate = plateNumber;
                data.step = 2;
                this.tempData.set(userId, data);
                await ctx.reply('2️⃣ Avtomobil egasining ism-familiyasini kiriting:\n' +
                    'Masalan: <code>Ali Valiyev</code>', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: [
                            ['❌ Bekor qilish']
                        ],
                        resize_keyboard: true
                    }
                });
            }
            else if (data.step === 2) {
                if (text.trim().length < 3) {
                    await ctx.reply('❌ Ism-familiya juda qisqa. Qaytadan kiriting:');
                    return;
                }
                data.ownerName = text.trim();
                data.step = 3;
                this.tempData.set(userId, data);
                await ctx.reply('3️⃣ Asosiy telefon raqamini kiriting:\n' +
                    'Masalan: <code>998901234567</code>', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: [
                            ['❌ Bekor qilish']
                        ],
                        resize_keyboard: true
                    }
                });
            }
            else if (data.step === 3) {
                if (!phone_util_1.PhoneUtil.validate(text)) {
                    data.phoneErrorCount = (data.phoneErrorCount || 0) + 1;
                    this.tempData.set(userId, data);
                    if (data.phoneErrorCount >= 3) {
                        await ctx.reply('❌ Telefon raqam noto\'g\'ri formatda!\n\n' +
                            'To\'g\'ri formatlar:\n' +
                            '• <code>998901234567</code>\n' +
                            '• <code>+998901234567</code>\n' +
                            '• <code>901234567</code>\n\n' +
                            'Qaytadan urinib ko\'ring yoki Bekor qilish bosing.', { parse_mode: 'HTML' });
                    }
                    else {
                        await ctx.reply(`❌ Noto\'g\'ri telefon raqami! (${data.phoneErrorCount}/3)\n` +
                            'To\'g\'ri format: <code>998901234567</code>', { parse_mode: 'HTML' });
                    }
                    return;
                }
                data.mainPhone = phone_util_1.PhoneUtil.format(text);
                data.phoneErrorCount = 0;
                data.step = 4;
                this.tempData.set(userId, data);
                await ctx.reply(`📞 Asosiy telefon raqam qabul qilindi: <code>${phone_util_1.PhoneUtil.display(data.mainPhone)}</code>\n\n` +
                    '4️⃣ **IKKINCHI TELEFON RAQAMINI** kiriting:\n' +
                    'Masalan: <code>998901234567</code> yoki <code>0</code> (agar bo\'lmasa)', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: [
                            ['❌ Bekor qilish']
                        ],
                        resize_keyboard: true
                    }
                });
            }
            else if (data.step === 4) {
                if (text === '0' || text.toLowerCase() === 'yo\'q' || text.toLowerCase() === 'yok') {
                    data.secondPhone = null;
                }
                else {
                    if (!phone_util_1.PhoneUtil.validate(text)) {
                        await ctx.reply('❌ Noto\'g\'ri telefon raqami!\nTo\'g\'ri format: <code>998901234567</code> yoki <code>0</code>', { parse_mode: 'HTML' });
                        return;
                    }
                    data.secondPhone = phone_util_1.PhoneUtil.format(text);
                }
                data.step = 5;
                this.tempData.set(userId, data);
                await ctx.reply('5️⃣ **TEX PASPORT OLD TOMONI (RAQAMLI) RASMINI** yuboring:\n' +
                    '<i>Rasm aniq va o\'qilishi oson bo\'lishi kerak</i>', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: [
                            ['❌ Bekor qilish']
                        ],
                        resize_keyboard: true
                    }
                });
            }
            else if (data.step === 8 && data.insuranceType === 'custom' && data.waitingForDate === 'start') {
                const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                if (!dateRegex.test(text.trim())) {
                    await ctx.reply('❌ Noto\'g\'ri format!\nTo\'g\'ri format: <code>15/03/2026</code>\n\nKun/Oy/Yil');
                    return;
                }
                const [day, month, year] = text.split('/').map(Number);
                const date = new Date(year, month - 1, day);
                if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                    await ctx.reply('❌ Bunday sana mavjud emas!');
                    return;
                }
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date < today) {
                    await ctx.reply('❌ Sug\'urta boshlanish sanasi o\'tgan vaqt bo\'lishi mumkin emas!');
                    return;
                }
                data.customStartDate = text;
                data.waitingForDate = 'end';
                this.tempData.set(userId, data);
                await ctx.reply(`📅 Sug'urta boshlanish sanasi: <b>${text}</b>\n\n` +
                    '**SUG\'URTA TUGASH SANASINI** kiriting:\n' +
                    'Masalan: <code>15/09/2026</code>', { parse_mode: 'HTML' });
            }
            else if (data.step === 8 && data.insuranceType === 'custom' && data.waitingForDate === 'end') {
                const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                if (!dateRegex.test(text.trim())) {
                    await ctx.reply('❌ Noto\'g\'ri format!\nTo\'g\'ri format: <code>15/09/2026</code>\n\nKun/Oy/Yil');
                    return;
                }
                const [day, month, year] = text.split('/').map(Number);
                const date = new Date(year, month - 1, day);
                if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                    await ctx.reply('❌ Bunday sana mavjud emas!');
                    return;
                }
                if (data.customStartDate) {
                    const [startDay, startMonth, startYear] = data.customStartDate.split('/').map(Number);
                    const startDate = new Date(startYear, startMonth - 1, startDay);
                    if (date <= startDate) {
                        await ctx.reply('❌ Tugash sanasi boshlanish sanasidan keyin bo\'lishi kerak!');
                        return;
                    }
                }
                data.customEndDate = text;
                const [sDay, sMonth, sYear] = data.customStartDate.split('/').map(Number);
                const [eDay, eMonth, eYear] = data.customEndDate.split('/').map(Number);
                data.startDate = new Date(sYear, sMonth - 1, sDay);
                data.endDate = new Date(eYear, eMonth - 1, eDay);
                data.step = 9;
                delete data.waitingForDate;
                this.tempData.set(userId, data);
                await this.showConfirmation(ctx, data);
            }
        }
        catch (error) {
            console.error('Add car scene error:', error);
            await ctx.reply('❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
        }
    }
    async onPhoto(ctx) {
        const userId = ctx.from?.id;
        if (!userId)
            return;
        const data = this.tempData.get(userId);
        if (!data) {
            await ctx.reply('❌ Xatolik yuz berdi. Qaytadan boshlang.');
            await this.returnToMainMenu(ctx);
            return;
        }
        const photos = ctx.message['photo'];
        if (!photos || photos.length === 0)
            return;
        const fileId = photos[photos.length - 1].file_id;
        try {
            if (data.step === 5) {
                data.techPhoto = fileId;
                data.step = 6;
                this.tempData.set(userId, data);
                await ctx.reply('📸 Tex pasport old tomoni qabul qilindi!\n\n' +
                    '6️⃣ **TEX PASPORT ORQA TOMONI (SERIYALI) RASMINI** yuboring:\n' +
                    '<i>Rasm aniq va seriya raqami o\'qilishi oson bo\'lishi kerak</i>', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: [
                            ['❌ Bekor qilish']
                        ],
                        resize_keyboard: true
                    }
                });
            }
            else if (data.step === 6) {
                data.techBackPhoto = fileId;
                data.step = 7;
                this.tempData.set(userId, data);
                await ctx.reply('📸 Tex pasport orqa tomoni qabul qilindi!\n\n' +
                    '7️⃣ **MASHINANING RASMINI** yuboring:\n' +
                    '<i>Avtomobil raqami aniq ko\'rinadigan rasm yuboring</i>', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: [
                            ['❌ Bekor qilish']
                        ],
                        resize_keyboard: true
                    }
                });
            }
            else if (data.step === 7) {
                data.carPhoto = fileId;
                data.step = 8;
                this.tempData.set(userId, data);
                await ctx.reply('📸 Mashina rasmi qabul qilindi!\n\n' +
                    '8️⃣ **SUG\'URTA MUDDATINI TANLANG**:', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [telegraf_1.Markup.button.callback('📆 24 kun', 'insurance_24days')],
                            [telegraf_1.Markup.button.callback('📆 6 oy', 'insurance_6months')],
                            [telegraf_1.Markup.button.callback('📆 1 yil', 'insurance_1year')],
                            [telegraf_1.Markup.button.callback('✏️ Custom (o\'zim kiritaman)', 'insurance_custom')]
                        ]
                    }
                });
            }
        }
        catch (error) {
            console.error('Photo handling error:', error);
            await ctx.reply('❌ Rasmni saqlashda xatolik yuz berdi.');
        }
    }
    async onInsuranceType(ctx) {
        const userId = ctx.from?.id;
        if (!userId) {
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
            return;
        }
        const data = this.tempData.get(userId);
        if (!data || data.step !== 8) {
            await ctx.answerCbQuery('❌ Xatolik yuz berdi. Qaytadan boshlang.');
            await this.returnToMainMenu(ctx);
            return;
        }
        try {
            const type = ctx.callbackQuery['data'].split('_')[1];
            data.insuranceType = type;
            if (type !== 'custom') {
                const startDate = new Date();
                let endDate = new Date();
                switch (type) {
                    case '24days':
                        endDate.setDate(endDate.getDate() + 24);
                        break;
                    case '6months':
                        endDate.setMonth(endDate.getMonth() + 6);
                        break;
                    case '1year':
                        endDate.setFullYear(endDate.getFullYear() + 1);
                        break;
                }
                data.startDate = startDate;
                data.endDate = endDate;
                data.step = 9;
                this.tempData.set(userId, data);
                await this.showConfirmation(ctx, data);
            }
            else {
                data.waitingForDate = 'start';
                this.tempData.set(userId, data);
                await ctx.editMessageText('✏️ <b>CUSTOM SUG\'URTA</b>\n\n' +
                    'Sug\'urta boshlanish sanasini kiriting:\n' +
                    'Masalan: <code>15/03/2026</code>', { parse_mode: 'HTML' });
            }
        }
        catch (error) {
            console.error('Insurance type error:', error);
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
        }
    }
    async showConfirmation(ctx, data) {
        const typeText = {
            '24days': '24 kun',
            '6months': '6 oy',
            '1year': '1 yil',
            'custom': 'Custom'
        }[data.insuranceType];
        const secondPhoneText = data.secondPhone
            ? `📞 Ikkinchi telefon: <code>${phone_util_1.PhoneUtil.display(data.secondPhone)}</code>\n`
            : '';
        const message = '━━━━━━━━━━━━━━━━━━\n' +
            '📝 <b>MAʼLUMOTLARNI TASDIQLASH</b>\n' +
            '━━━━━━━━━━━━━━━━━━\n\n' +
            `🚗 Avtomobil raqami: <b>${data.plate}</b>\n` +
            `👤 Avtomobil egasi: <b>${data.ownerName}</b>\n` +
            `📞 Asosiy telefon: <code>${phone_util_1.PhoneUtil.display(data.mainPhone)}</code>\n` +
            `${secondPhoneText}` +
            `📸 Tex pasport old tomoni: ✅\n` +
            `📸 Tex pasport orqa tomoni: ✅\n` +
            `📸 Mashina rasmi: ✅\n` +
            '━━━━━━━━━━━━━━━━━━\n\n' +
            `📅 Sugʻurta turi: <b>${typeText}</b>\n` +
            `📆 Boshlanish sanasi: <b>${data.startDate.toLocaleDateString('uz-UZ')}</b>\n` +
            `📆 Tugash sanasi: <b>${data.endDate.toLocaleDateString('uz-UZ')}</b>\n` +
            '━━━━━━━━━━━━━━━━━━\n\n' +
            `💰 KPI: <b>+${kpi_constants_1.KPI.registrar.perCar.toLocaleString()} soʻm</b>\n` +
            '━━━━━━━━━━━━━━━━━━\n\n' +
            `Tasdiqlaysizmi?`;
        await ctx.editMessageText(message, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        telegraf_1.Markup.button.callback('✅ Ha, operatorga yuborish', 'send_to_moderation'),
                        telegraf_1.Markup.button.callback('❌ Bekor qilish', 'cancel_save_car')
                    ]
                ]
            }
        });
    }
    async onSendToModeration(ctx) {
        const userId = ctx.from?.id;
        if (!userId) {
            await ctx.answerCbQuery('❌ Xatolik yuz berdi');
            return;
        }
        const data = this.tempData.get(userId);
        if (!data || data.step !== 9) {
            await ctx.answerCbQuery('❌ Xatolik yuz berdi. Qaytadan boshlang.');
            await this.returnToMainMenu(ctx);
            return;
        }
        try {
            await ctx.answerCbQuery('⏳ Yuborilmoqda...');
            const registrar = await this.userRepo.findOne({
                where: { telegramId: String(userId) }
            });
            if (!registrar) {
                await ctx.reply('❌ Foydalanuvchi topilmadi!');
                await this.returnToMainMenu(ctx);
                return;
            }
            const uploadDir = path.join(process.cwd(), 'uploads', 'cars', data.plate);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const techPhotoLink = await ctx.telegram.getFileLink(data.techPhoto);
            const techBackPhotoLink = await ctx.telegram.getFileLink(data.techBackPhoto);
            const carPhotoLink = await ctx.telegram.getFileLink(data.carPhoto);
            const techPhotoPath = path.join(uploadDir, `tech_front_${Date.now()}.jpg`);
            const techBackPhotoPath = path.join(uploadDir, `tech_back_${Date.now()}.jpg`);
            const carPhotoPath = path.join(uploadDir, `car_${Date.now()}.jpg`);
            await this.downloadFile(techPhotoLink.href, techPhotoPath);
            await this.downloadFile(techBackPhotoLink.href, techBackPhotoPath);
            await this.downloadFile(carPhotoLink.href, carPhotoPath);
            const baseUrl = process.env.APP_URL || 'http://localhost:3000';
            const techRelativePath = `/uploads/cars/${data.plate}/${path.basename(techPhotoPath)}`;
            const techBackRelativePath = `/uploads/cars/${data.plate}/${path.basename(techBackPhotoPath)}`;
            const carRelativePath = `/uploads/cars/${data.plate}/${path.basename(carPhotoPath)}`;
            const moderationData = {
                plateNumber: data.plate,
                ownerName: data.ownerName,
                ownerPhone: data.mainPhone,
                secondPhone: data.secondPhone || null,
                techPhoto: techRelativePath,
                techBackPhoto: techBackRelativePath,
                carPhoto: carRelativePath,
                insuranceType: data.insuranceType,
                startDate: data.startDate,
                endDate: data.endDate,
                registrarId: registrar.id,
                registrarName: registrar.firstName || registrar.username || 'Noma\'lum',
                registrarTelegramId: registrar.telegramId,
                submittedAt: new Date()
            };
            console.log('📤 Moderatsiyaga yuborilmoqda:', {
                plateNumber: moderationData.plateNumber,
                registrar: moderationData.registrarName,
                insuranceType: moderationData.insuranceType
            });
            const moderationId = await this.moderationService.create(moderationData);
            const secondPhoneText = data.secondPhone
                ? `\n📞 Ikkinchi telefon: <code>${phone_util_1.PhoneUtil.display(data.secondPhone)}</code>`
                : '';
            await ctx.editMessageText(`━━━━━━━━━━━━━━━━━━\n` +
                `✅ <b>MAʼLUMOTLAR YUBORILDI!</b>\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `🚗 Avtomobil: <b>${data.plate}</b>\n` +
                `👤 Ega: <b>${data.ownerName}</b>\n` +
                `📞 Asosiy tel: <code>${phone_util_1.PhoneUtil.display(data.mainPhone)}</code>${secondPhoneText}\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📋 Moderatsiya ID: <code>${moderationId}</code>\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `Operatorlar tekshirib, natijani bildiradi.\n` +
                `⏳ Iltimos, kuting...`, { parse_mode: 'HTML' });
            const user = await this.userRepo.findOne({
                where: { telegramId: String(userId) }
            });
            await ctx.reply('🏠 Asosiy menyu', this.mainKeyboard.getMainKeyboard(user?.role || 'registrar'));
            this.tempData.delete(userId);
            await this.leaveScene(ctx);
        }
        catch (error) {
            console.error('❌ Send to moderation error:', error);
            await ctx.reply('❌ Saqlashda xatolik yuz berdi!');
            await this.returnToMainMenu(ctx);
        }
    }
    async onCancel(ctx) {
        const userId = ctx.from?.id;
        await ctx.editMessageText('❌ Bekor qilindi');
        const user = await this.userRepo.findOne({
            where: { telegramId: String(userId) }
        });
        await ctx.reply('🏠 Asosiy menyu', this.mainKeyboard.getMainKeyboard(user?.role || 'registrar'));
        await this.leaveScene(ctx);
    }
    async downloadFile(url, outputPath) {
        const response = await (0, axios_1.default)({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`✅ Fayl yuklandi: ${outputPath}`);
                resolve();
            });
            writer.on('error', (error) => {
                console.error(`❌ Fayl yuklanmadi: ${outputPath}`, error);
                reject(error);
            });
        });
    }
    async returnToMainMenu(ctx) {
        try {
            const userId = ctx.from?.id;
            const user = await this.userRepo.findOne({
                where: { telegramId: String(userId) }
            });
            if (ctx.callbackQuery) {
                await ctx.editMessageText('❌ Amal bekor qilindi').catch(() => { });
            }
            await ctx.reply('🏠 Asosiy menyu', this.mainKeyboard.getMainKeyboard(user?.role || 'registrar'));
            await this.leaveScene(ctx);
        }
        catch (error) {
            console.error('Return to main menu error:', error);
            await this.leaveScene(ctx);
        }
    }
    async onLeave(ctx) {
        const userId = ctx.from?.id;
        if (userId) {
            this.tempData.delete(userId);
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
exports.AddCarScene = AddCarScene;
__decorate([
    (0, nestjs_telegraf_1.SceneEnter)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AddCarScene.prototype, "onEnter", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AddCarScene.prototype, "onText", null);
__decorate([
    (0, nestjs_telegraf_1.On)('photo'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AddCarScene.prototype, "onPhoto", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/^insurance_(24days|6months|1year|custom)$/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AddCarScene.prototype, "onInsuranceType", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('send_to_moderation'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AddCarScene.prototype, "onSendToModeration", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('cancel_save_car'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AddCarScene.prototype, "onCancel", null);
__decorate([
    (0, nestjs_telegraf_1.SceneLeave)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AddCarScene.prototype, "onLeave", null);
exports.AddCarScene = AddCarScene = __decorate([
    (0, nestjs_telegraf_1.Scene)('ADD_CAR'),
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(car_entity_1.Car)),
    __param(1, (0, typeorm_1.InjectRepository)(insurance_entity_1.CarInsurance)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bot_service_1.BotService,
        moderation_service_1.ModerationService,
        main_keyboard_1.MainKeyboard])
], AddCarScene);
//# sourceMappingURL=add-car.scene.js.map
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
var ModerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const car_entity_1 = require("../../database/entities/car.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const insurance_entity_1 = require("../../database/entities/insurance.entity");
const bot_service_1 = require("../bot/bot.service");
const telegraf_1 = require("telegraf");
let ModerationService = ModerationService_1 = class ModerationService {
    constructor(carRepo, userRepo, insuranceRepo, botService) {
        this.carRepo = carRepo;
        this.userRepo = userRepo;
        this.insuranceRepo = insuranceRepo;
        this.botService = botService;
        this.logger = new common_1.Logger(ModerationService_1.name);
        this.moderationStorage = new Map();
        this.EXPIRY_TIME = 24 * 60 * 60 * 1000;
        this.fieldNames = {
            'plateNumber': 'Avtomobil raqami',
            'ownerName': 'Avtomobil egasi',
            'ownerPhone': 'Asosiy telefon',
            'secondPhone': 'Ikkinchi telefon',
            'techPhoto': 'Tex pasport old tomoni',
            'techBackPhoto': 'Tex pasport orqa tomoni (seriyali)',
            'carPhoto': 'Mashina rasmi',
            'insurance': 'Sug\'urta muddati',
            'other': 'Boshqa'
        };
        setInterval(() => this.cleanExpired(), 60 * 60 * 1000);
        setInterval(() => this.remindOperators(), 10 * 60 * 1000);
        this.logger.log('🔄 ModerationService ishga tushdi');
    }
    async create(data) {
        const id = this.generateModerationId();
        const moderation = {
            id,
            data,
            status: 'pending',
            notifiedOperators: [],
            expiresAt: Date.now() + this.EXPIRY_TIME
        };
        this.moderationStorage.set(id, moderation);
        this.logger.log(`✅ Moderatsiya yaratildi: ${id} - ${data.plateNumber} (${data.insuranceType})`);
        this.logger.log(`📊 Jami moderatsiyalar: ${this.moderationStorage.size} ta`);
        await this.notifyOperators(id);
        setTimeout(async () => {
            await this.autoReject(id);
        }, this.EXPIRY_TIME);
        return id;
    }
    async notifyOperators(moderationId) {
        try {
            const moderation = this.moderationStorage.get(moderationId);
            if (!moderation || moderation.status !== 'pending')
                return;
            const operators = await this.userRepo.find({
                where: { role: 'operator', isActive: true }
            });
            if (operators.length === 0) {
                this.logger.warn('⚠️ Faol operatorlar topilmadi');
                return;
            }
            const data = moderation.data;
            const baseUrl = process.env.APP_URL || 'http://localhost:3000';
            const techPhotoFullUrl = data.techPhoto ? `${baseUrl}${data.techPhoto}` : null;
            const techBackPhotoFullUrl = data.techBackPhoto ? `${baseUrl}${data.techBackPhoto}` : null;
            const carPhotoFullUrl = data.carPhoto ? `${baseUrl}${data.carPhoto}` : null;
            const insuranceTypeText = this.getInsuranceTypeText(data.insuranceType);
            const techPhotoLink = techPhotoFullUrl
                ? `📸 <a href="${techPhotoFullUrl}">Tex pasport old tomoni</a>\n`
                : '';
            const techBackPhotoLink = techBackPhotoFullUrl
                ? `📸 <a href="${techBackPhotoFullUrl}">Tex pasport orqa tomoni (seriyali)</a>\n`
                : '';
            const carPhotoLink = carPhotoFullUrl
                ? `📸 <a href="${carPhotoFullUrl}">Mashina rasmi</a>\n`
                : '';
            const secondPhoneText = data.secondPhone
                ? `📞 Ikkinchi telefon: <code>${this.formatPhone(data.secondPhone)}</code>\n`
                : '';
            const message = `━━━━━━━━━━━━━━━━━━\n` +
                `🔄 <b>YANGI AVTOMOBIL MODERATSIYASI</b>\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📋 <b>MA'LUMOTLAR:</b>\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `🚗 Avtomobil raqami: <b>${data.plateNumber}</b>\n` +
                `👤 Avtomobil egasi: <b>${data.ownerName}</b>\n` +
                `📞 Asosiy telefon: <code>${this.formatPhone(data.ownerPhone)}</code>\n` +
                `${secondPhoneText}` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `📅 Sug'urta turi: <b>${insuranceTypeText}</b>\n` +
                `📆 Boshlanishi: ${new Date(data.startDate).toLocaleDateString('uz-UZ')}\n` +
                `📆 Tugashi: ${new Date(data.endDate).toLocaleDateString('uz-UZ')}\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📸 <b>RASMLAR:</b>\n` +
                `${techPhotoLink}` +
                `${techBackPhotoLink}` +
                `${carPhotoLink}` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `👤 Registrar: <b>${data.registrarName}</b>\n` +
                `📅 Sana: ${new Date(data.submittedAt).toLocaleString('uz-UZ')}\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `Tasdiqlaysizmi?`;
            for (const operator of operators) {
                try {
                    const keyboard = telegraf_1.Markup.inlineKeyboard([
                        [
                            telegraf_1.Markup.button.callback('✅ Tasdiqlash', `mod_approve_${moderationId}`),
                            telegraf_1.Markup.button.callback('❌ Rad etish', `mod_reject_${moderationId}`)
                        ],
                        [
                            telegraf_1.Markup.button.callback('📸 Rasmlarni koʻrish', `mod_photos_${moderationId}`),
                            telegraf_1.Markup.button.callback('📋 Batafsil', `mod_details_${moderationId}`)
                        ]
                    ]);
                    await this.botService.sendMessage(operator.telegramId, message, keyboard);
                    moderation.notifiedOperators.push(operator.id);
                    this.logger.log(`📢 Operator #${operator.id} ga xabar yuborildi`);
                }
                catch (error) {
                    this.logger.error(`❌ Operator #${operator.id} ga xabar yuborishda xatolik: ${error.message}`);
                }
            }
            this.moderationStorage.set(moderationId, moderation);
        }
        catch (error) {
            this.logger.error(`❌ Operatorlarga xabar yuborishda xatolik: ${error.message}`);
        }
    }
    async markNotified(moderationId, operatorId) {
        try {
            const moderation = this.moderationStorage.get(moderationId);
            if (!moderation) {
                this.logger.warn(`⚠️ markNotified: Moderatsiya topilmadi: ${moderationId}`);
                return;
            }
            if (!moderation.notifiedOperators.includes(operatorId)) {
                moderation.notifiedOperators.push(operatorId);
                this.moderationStorage.set(moderationId, moderation);
                this.logger.log(`📢 Operator #${operatorId} ga xabar yuborilgani belgilandi (${moderationId})`);
            }
        }
        catch (error) {
            this.logger.error(`❌ markNotified xatosi: ${error.message}`);
        }
    }
    async notifyApproval(moderationId, car) {
        try {
            const moderation = this.moderationStorage.get(moderationId);
            if (!moderation)
                return;
            const data = moderation.data;
            const registrar = await this.userRepo.findOne({
                where: { id: data.registrarId }
            });
            const insuranceTypeText = this.getInsuranceTypeText(data.insuranceType);
            const baseUrl = process.env.APP_URL || 'http://localhost:3000';
            const techPhotoFullUrl = data.techPhoto ? `${baseUrl}${data.techPhoto}` : null;
            const techBackPhotoFullUrl = data.techBackPhoto ? `${baseUrl}${data.techBackPhoto}` : null;
            const carPhotoFullUrl = data.carPhoto ? `${baseUrl}${data.carPhoto}` : null;
            const techPhotoLink = techPhotoFullUrl
                ? `📸 <a href="${techPhotoFullUrl}">Tex pasport old tomoni</a>\n`
                : '';
            const techBackPhotoLink = techBackPhotoFullUrl
                ? `📸 <a href="${techBackPhotoFullUrl}">Tex pasport orqa tomoni (seriyali)</a>\n`
                : '';
            const carPhotoLink = carPhotoFullUrl
                ? `📸 <a href="${carPhotoFullUrl}">Mashina rasmi</a>\n`
                : '';
            const secondPhoneText = data.secondPhone
                ? `📞 Ikkinchi telefon: <code>${this.formatPhone(data.secondPhone)}</code>\n`
                : '';
            if (registrar?.telegramId) {
                const registrarMessage = `━━━━━━━━━━━━━━━━━━\n` +
                    `✅ <b>AVTOMOBIL TASDIQLANDI!</b>\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `🚗 Avtomobil: <b>${data.plateNumber}</b>\n` +
                    `👤 Ega: <b>${data.ownerName}</b>\n` +
                    `📞 Asosiy tel: <code>${this.formatPhone(data.ownerPhone)}</code>\n` +
                    `${secondPhoneText}` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `📅 Sug'urta: <b>${insuranceTypeText}</b>\n` +
                    `📆 Boshlanishi: ${new Date(data.startDate).toLocaleDateString('uz-UZ')}\n` +
                    `📆 Tugashi: ${new Date(data.endDate).toLocaleDateString('uz-UZ')}\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `📸 <b>RASMLAR:</b>\n` +
                    `${techPhotoLink}` +
                    `${techBackPhotoLink}` +
                    `${carPhotoLink}` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `📅 Sana: ${new Date().toLocaleString('uz-UZ')}\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `✅ Avtomobil ma'lumotlar bazasiga qo'shildi.\n\n` +
                    `💰 KPI: <b>+${this.calculateKPI(data.insuranceType)} soʻm</b>`;
                await this.botService.sendMessage(registrar.telegramId, registrarMessage);
                await this.botService.sendMessage(registrar.telegramId, '🏠 Asosiy menyu', {
                    reply_markup: {
                        keyboard: [
                            ['🚗 Avtomobil qo\'shish'],
                            ['🏠 Mening natijam'],
                            ['📄 Qoidalar', '📞 Yordam']
                        ],
                        resize_keyboard: true
                    }
                });
                this.logger.log(`📨 Registrarga tasdiqlash xabari yuborildi va asosiy menyuga qaytarildi: ${registrar.telegramId}`);
            }
            const admins = await this.userRepo.find({ where: { role: 'admin', isActive: true } });
            const operator = await this.userRepo.findOne({ where: { id: moderation.moderatedBy } });
            for (const admin of admins) {
                const adminMessage = `━━━━━━━━━━━━━━━━━━\n` +
                    `✅ <b>AVTOMOBIL TASDIQLANDI</b>\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `🚗 Avtomobil: <b>${data.plateNumber}</b>\n` +
                    `👤 Ega: <b>${data.ownerName}</b>\n` +
                    `📞 Tel: <code>${this.formatPhone(data.ownerPhone)}</code>\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `📅 Sug'urta: <b>${insuranceTypeText}</b>\n` +
                    `📆 Tugash: ${new Date(data.endDate).toLocaleDateString('uz-UZ')}\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `👤 Operator: <b>${operator?.firstName || operator?.username || 'Noma\'lum'}</b>\n` +
                    `👤 Registrar: <b>${data.registrarName}</b>\n` +
                    `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
                await this.botService.sendMessage(admin.telegramId, adminMessage);
            }
        }
        catch (error) {
            this.logger.error(`❌ Tasdiqlash xabarini yuborishda xatolik: ${error.message}`);
        }
    }
    async notifyRejection(moderationId, reason) {
        try {
            const moderation = this.moderationStorage.get(moderationId);
            if (!moderation)
                return;
            const data = moderation.data;
            const registrar = await this.userRepo.findOne({
                where: { id: data.registrarId }
            });
            const fieldName = reason.field ? this.fieldNames[reason.field] || reason.field : '';
            const fieldText = reason.field ? `\n📋 <b>Xato maydon:</b> ${fieldName}` : '';
            const detailsText = reason.details ? `\n📝 <b>Tafsilot:</b> ${reason.details}` : '';
            const insuranceTypeText = this.getInsuranceTypeText(data.insuranceType);
            const baseUrl = process.env.APP_URL || 'http://localhost:3000';
            const techPhotoFullUrl = data.techPhoto ? `${baseUrl}${data.techPhoto}` : null;
            const techBackPhotoFullUrl = data.techBackPhoto ? `${baseUrl}${data.techBackPhoto}` : null;
            const carPhotoFullUrl = data.carPhoto ? `${baseUrl}${data.carPhoto}` : null;
            const techPhotoLink = techPhotoFullUrl
                ? `📸 <a href="${techPhotoFullUrl}">Tex pasport old tomoni</a>\n`
                : '';
            const techBackPhotoLink = techBackPhotoFullUrl
                ? `📸 <a href="${techBackPhotoFullUrl}">Tex pasport orqa tomoni (seriyali)</a>\n`
                : '';
            const carPhotoLink = carPhotoFullUrl
                ? `📸 <a href="${carPhotoFullUrl}">Mashina rasmi</a>\n`
                : '';
            const secondPhoneText = data.secondPhone
                ? `📞 Ikkinchi telefon: <code>${this.formatPhone(data.secondPhone)}</code>\n`
                : '';
            if (registrar?.telegramId) {
                const registrarMessage = `━━━━━━━━━━━━━━━━━━\n` +
                    `❌ <b>AVTOMOBIL RAD ETILDI!</b>\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `🚗 Avtomobil: <b>${data.plateNumber}</b>\n` +
                    `👤 Ega: <b>${data.ownerName}</b>\n` +
                    `📞 Asosiy tel: <code>${this.formatPhone(data.ownerPhone)}</code>\n` +
                    `${secondPhoneText}` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `📅 Sug'urta: <b>${insuranceTypeText}</b>\n` +
                    `📆 Boshlanishi: ${new Date(data.startDate).toLocaleDateString('uz-UZ')}\n` +
                    `📆 Tugashi: ${new Date(data.endDate).toLocaleDateString('uz-UZ')}\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `📸 <b>RASMLAR:</b>\n` +
                    `${techPhotoLink}` +
                    `${techBackPhotoLink}` +
                    `${carPhotoLink}` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `${fieldText}` +
                    `\n📋 <b>Sabab:</b> ${reason.message}` +
                    `${detailsText}\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `📅 Sana: ${new Date().toLocaleString('uz-UZ')}\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `❌ Avtomobil ma'lumotlar bazasiga qo'shilmadi.\n\n` +
                    `Iltimos, ma'lumotlarni tekshirib qaytadan yuboring.`;
                await this.botService.sendMessage(registrar.telegramId, registrarMessage);
                await this.botService.sendMessage(registrar.telegramId, '🏠 Asosiy menyu', {
                    reply_markup: {
                        keyboard: [
                            ['🚗 Avtomobil qo\'shish'],
                            ['🏠 Mening natijam'],
                            ['📄 Qoidalar', '📞 Yordam']
                        ],
                        resize_keyboard: true
                    }
                });
                this.logger.log(`📨 Registrarga rad etish xabari yuborildi va asosiy menyuga qaytarildi: ${registrar.telegramId} - Sabab: ${reason.message}`);
            }
            const admins = await this.userRepo.find({ where: { role: 'admin', isActive: true } });
            const operator = await this.userRepo.findOne({ where: { id: moderation.moderatedBy } });
            for (const admin of admins) {
                const adminMessage = `━━━━━━━━━━━━━━━━━━\n` +
                    `❌ <b>AVTOMOBIL RAD ETILDI</b>\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `🚗 Avtomobil: <b>${data.plateNumber}</b>\n` +
                    `👤 Ega: <b>${data.ownerName}</b>\n` +
                    `📞 Tel: <code>${this.formatPhone(data.ownerPhone)}</code>\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `📅 Sug'urta: <b>${insuranceTypeText}</b>\n` +
                    `📆 Tugash: ${new Date(data.endDate).toLocaleDateString('uz-UZ')}\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `👤 Operator: <b>${operator?.firstName || operator?.username || 'Noma\'lum'}</b>\n` +
                    `👤 Registrar: <b>${data.registrarName}</b>\n` +
                    `📋 <b>Sabab:</b> ${reason.message}\n` +
                    `${reason.details ? `📝 <b>Tafsilot:</b> ${reason.details}\n` : ''}` +
                    `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
                await this.botService.sendMessage(admin.telegramId, adminMessage);
            }
        }
        catch (error) {
            this.logger.error(`❌ Rad etish xabarini yuborishda xatolik: ${error.message}`);
        }
    }
    async autoReject(id) {
        const moderation = this.moderationStorage.get(id);
        if (!moderation || moderation.status !== 'pending')
            return;
        moderation.status = 'rejected';
        moderation.rejectionReason = {
            field: 'other',
            message: '⏰ Moderatsiya muddati tugadi (24 soat)'
        };
        this.moderationStorage.set(id, moderation);
        const data = moderation.data;
        const registrar = await this.userRepo.findOne({
            where: { id: data.registrarId }
        });
        const insuranceTypeText = this.getInsuranceTypeText(data.insuranceType);
        const baseUrl = process.env.APP_URL || 'http://localhost:3000';
        const techPhotoFullUrl = data.techPhoto ? `${baseUrl}${data.techPhoto}` : null;
        const techBackPhotoFullUrl = data.techBackPhoto ? `${baseUrl}${data.techBackPhoto}` : null;
        const carPhotoFullUrl = data.carPhoto ? `${baseUrl}${data.carPhoto}` : null;
        const techPhotoLink = techPhotoFullUrl
            ? `📸 <a href="${techPhotoFullUrl}">Tex pasport old tomoni</a>\n`
            : '';
        const techBackPhotoLink = techBackPhotoFullUrl
            ? `📸 <a href="${techBackPhotoFullUrl}">Tex pasport orqa tomoni (seriyali)</a>\n`
            : '';
        const carPhotoLink = carPhotoFullUrl
            ? `📸 <a href="${carPhotoFullUrl}">Mashina rasmi</a>\n`
            : '';
        const secondPhoneText = data.secondPhone
            ? `📞 Ikkinchi telefon: <code>${this.formatPhone(data.secondPhone)}</code>\n`
            : '';
        if (registrar?.telegramId) {
            const message = `━━━━━━━━━━━━━━━━━━\n` +
                `⏰ <b>MODERATSIYA MUDDATI TUGADI!</b>\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `🚗 Avtomobil: <b>${data.plateNumber}</b>\n` +
                `👤 Ega: ${data.ownerName}\n` +
                `📞 Tel: ${this.formatPhone(data.ownerPhone)}\n` +
                `${secondPhoneText}` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `📅 Sug'urta: <b>${insuranceTypeText}</b>\n` +
                `📆 Boshlanishi: ${new Date(data.startDate).toLocaleDateString('uz-UZ')}\n` +
                `📆 Tugashi: ${new Date(data.endDate).toLocaleDateString('uz-UZ')}\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📸 <b>RASMLAR:</b>\n` +
                `${techPhotoLink}` +
                `${techBackPhotoLink}` +
                `${carPhotoLink}` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📋 Sabab: 24 soat ichida operator javob bermadi\n` +
                `📅 Sana: ${new Date().toLocaleString('uz-UZ')}\n\n` +
                `❌ Avtomobil avtomatik rad etildi.\n\n` +
                `Iltimos, ma'lumotlarni tekshirib qaytadan yuboring.`;
            await this.botService.sendMessage(registrar.telegramId, message);
            await this.botService.sendMessage(registrar.telegramId, '🏠 Asosiy menyu', {
                reply_markup: {
                    keyboard: [
                        ['🚗 Avtomobil qo\'shish'],
                        ['🏠 Mening natijam'],
                        ['📄 Qoidalar', '📞 Yordam']
                    ],
                    resize_keyboard: true
                }
            });
            this.logger.log(`📨 Registrarga muddat tugaganligi haqida xabar yuborildi va asosiy menyuga qaytarildi: ${registrar.telegramId}`);
        }
        const admins = await this.userRepo.find({ where: { role: 'admin', isActive: true } });
        for (const admin of admins) {
            const adminMessage = `━━━━━━━━━━━━━━━━━━\n` +
                `⏰ <b>MODERATSIYA MUDDATI TUGADI</b>\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `🚗 Avtomobil: <b>${data.plateNumber}</b>\n` +
                `👤 Ega: ${data.ownerName}\n` +
                `📞 Tel: ${this.formatPhone(data.ownerPhone)}\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `📅 Sug'urta: <b>${insuranceTypeText}</b>\n` +
                `📆 Tugash: ${new Date(data.endDate).toLocaleDateString('uz-UZ')}\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `👤 Registrar: <b>${data.registrarName}</b>\n` +
                `📋 Sabab: 24 soat ichida operator javob bermadi\n` +
                `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
            await this.botService.sendMessage(admin.telegramId, adminMessage);
        }
        this.logger.warn(`⏰ Moderatsiya muddati tugadi: ${id}`);
    }
    async get(id) {
        this.logger.debug(`🔍 Moderatsiya so'rovi: ${id}`);
        const moderation = this.moderationStorage.get(id);
        if (!moderation) {
            this.logger.warn(`⚠️ Moderatsiya topilmadi: ${id}`);
            return null;
        }
        if (moderation.expiresAt < Date.now()) {
            this.logger.warn(`⏰ Moderatsiya muddati o'tgan: ${id}`);
            await this.autoReject(id);
            return null;
        }
        return moderation;
    }
    async approve(id, operatorId) {
        try {
            const moderation = await this.get(id);
            if (!moderation) {
                return { success: false, message: '❌ Moderatsiya topilmadi yoki muddati o\'tgan' };
            }
            if (moderation.status !== 'pending') {
                const statusText = moderation.status === 'approved' ? 'tasdiqlangan' : 'rad etilgan';
                return {
                    success: false,
                    message: `❌ Moderatsiya allaqachon ${statusText}`
                };
            }
            const operator = await this.userRepo.findOne({ where: { id: operatorId } });
            if (!operator) {
                return { success: false, message: '❌ Operator topilmadi' };
            }
            const car = new car_entity_1.Car();
            car.plateNumber = moderation.data.plateNumber;
            car.ownerName = moderation.data.ownerName;
            car.ownerPhone = moderation.data.ownerPhone;
            car.secondPhone = moderation.data.secondPhone;
            car.techPhoto = moderation.data.techPhoto;
            car.techBackPhoto = moderation.data.techBackPhoto;
            car.carPhoto = moderation.data.carPhoto;
            car.moderationStatus = 'approved';
            car.moderatedById = operatorId;
            car.moderatedAt = new Date();
            car.submittedById = moderation.data.registrarId;
            car.createdById = moderation.data.registrarId;
            const savedCar = await this.carRepo.save(car);
            const insurance = new insurance_entity_1.CarInsurance();
            insurance.carId = savedCar.id;
            insurance.startDate = moderation.data.startDate;
            insurance.endDate = moderation.data.endDate;
            insurance.type = moderation.data.insuranceType;
            insurance.createdById = operatorId;
            insurance.status = 'active';
            await this.insuranceRepo.save(insurance);
            moderation.status = 'approved';
            moderation.moderatedBy = operatorId;
            moderation.moderatedAt = new Date();
            this.moderationStorage.set(id, moderation);
            await this.notifyApproval(id, savedCar);
            this.logger.log(`✅ Moderatsiya tasdiqlandi: ${id} - Operator: ${operator.firstName || operator.username}`);
            return {
                success: true,
                car: savedCar,
                message: '✅ Avtomobil muvaffaqiyatli tasdiqlandi'
            };
        }
        catch (error) {
            this.logger.error(`❌ Moderatsiyani tasdiqlashda xatolik: ${error.message}`);
            return { success: false, message: '❌ Xatolik yuz berdi' };
        }
    }
    async reject(id, operatorId, reason) {
        try {
            const moderation = await this.get(id);
            if (!moderation) {
                return { success: false, message: '❌ Moderatsiya topilmadi yoki muddati o\'tgan' };
            }
            if (moderation.status !== 'pending') {
                const statusText = moderation.status === 'approved' ? 'tasdiqlangan' : 'rad etilgan';
                return {
                    success: false,
                    message: `❌ Moderatsiya allaqachon ${statusText}`
                };
            }
            const operator = await this.userRepo.findOne({ where: { id: operatorId } });
            if (!operator) {
                return { success: false, message: '❌ Operator topilmadi' };
            }
            moderation.status = 'rejected';
            moderation.moderatedBy = operatorId;
            moderation.moderatedAt = new Date();
            moderation.rejectionReason = reason;
            this.moderationStorage.set(id, moderation);
            await this.notifyRejection(id, reason);
            this.logger.log(`❌ Moderatsiya rad etildi: ${id} - Operator: ${operator.firstName || operator.username} - Sabab: ${reason.message}`);
            return {
                success: true,
                message: '❌ Avtomobil rad etildi'
            };
        }
        catch (error) {
            this.logger.error(`❌ Moderatsiyani rad etishda xatolik: ${error.message}`);
            return { success: false, message: '❌ Xatolik yuz berdi' };
        }
    }
    async getPendingCount() {
        let count = 0;
        const now = Date.now();
        for (const moderation of this.moderationStorage.values()) {
            if (moderation.status === 'pending' && moderation.expiresAt > now) {
                count++;
            }
        }
        return count;
    }
    async getPending() {
        const pending = [];
        const now = Date.now();
        for (const moderation of this.moderationStorage.values()) {
            if (moderation.status === 'pending' && moderation.expiresAt > now) {
                pending.push(moderation);
            }
        }
        return pending;
    }
    async getOperatorModerations(operatorId) {
        const result = [];
        const now = Date.now();
        for (const moderation of this.moderationStorage.values()) {
            if (moderation.notifiedOperators.includes(operatorId) && moderation.expiresAt > now) {
                result.push(moderation);
            }
        }
        return result;
    }
    async getOperatorStats(operatorId) {
        let todayApproved = 0;
        let todayRejected = 0;
        let monthApproved = 0;
        let monthRejected = 0;
        let totalApproved = 0;
        let totalRejected = 0;
        let totalTime = 0;
        let totalModerated = 0;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        for (const moderation of this.moderationStorage.values()) {
            if (moderation.moderatedBy === operatorId && moderation.moderatedAt) {
                const moderatedAt = new Date(moderation.moderatedAt);
                if (moderation.status === 'approved')
                    totalApproved++;
                if (moderation.status === 'rejected')
                    totalRejected++;
                if (moderatedAt >= today) {
                    if (moderation.status === 'approved')
                        todayApproved++;
                    if (moderation.status === 'rejected')
                        todayRejected++;
                }
                if (moderatedAt >= monthStart) {
                    if (moderation.status === 'approved')
                        monthApproved++;
                    if (moderation.status === 'rejected')
                        monthRejected++;
                }
                if (moderation.moderatedAt) {
                    const submittedAt = new Date(moderation.data.submittedAt).getTime();
                    const moderatedAtTime = new Date(moderation.moderatedAt).getTime();
                    totalTime += (moderatedAtTime - submittedAt) / (1000 * 60 * 60);
                    totalModerated++;
                }
            }
        }
        const avgTime = totalModerated > 0 ? Math.round(totalTime / totalModerated) : 0;
        return {
            today: { approved: todayApproved, rejected: todayRejected },
            month: { approved: monthApproved, rejected: monthRejected },
            total: { approved: totalApproved, rejected: totalRejected },
            avgTime
        };
    }
    async remindOperators() {
        try {
            const now = Date.now();
            const pendingModerations = await this.getPending();
            for (const moderation of pendingModerations) {
                const timeLeft = Math.round((moderation.expiresAt - now) / (60 * 60 * 1000));
                if (timeLeft === 6 || timeLeft === 1) {
                    const operators = await this.userRepo.find({
                        where: { role: 'operator', isActive: true }
                    });
                    for (const operator of operators) {
                        if (!moderation.notifiedOperators.includes(operator.id))
                            continue;
                        const message = `⏰ <b>ESLATMA!</b>\n\n` +
                            `🚗 Avtomobil: <b>${moderation.data.plateNumber}</b>\n` +
                            `👤 Ega: ${moderation.data.ownerName}\n` +
                            `📞 Tel: ${this.formatPhone(moderation.data.ownerPhone)}\n\n` +
                            `⏳ Moderatsiya muddati tugashiga ${timeLeft} soat qoldi!\n\n` +
                            `Iltimos, tezroq javob bering.`;
                        const keyboard = telegraf_1.Markup.inlineKeyboard([
                            [
                                telegraf_1.Markup.button.callback('✅ Tasdiqlash', `mod_approve_${moderation.id}`),
                                telegraf_1.Markup.button.callback('❌ Rad etish', `mod_reject_${moderation.id}`)
                            ]
                        ]);
                        await this.botService.sendMessage(operator.telegramId, message, keyboard);
                    }
                    this.logger.log(`⏰ Eslatma yuborildi: ${moderation.id} - ${timeLeft} soat qoldi`);
                }
            }
        }
        catch (error) {
            this.logger.error(`❌ Eslatma yuborishda xatolik: ${error.message}`);
        }
    }
    async cleanExpired() {
        const now = Date.now();
        let cleaned = 0;
        for (const [id, moderation] of this.moderationStorage.entries()) {
            if (moderation.expiresAt < now) {
                if (moderation.status === 'pending') {
                    await this.autoReject(id);
                }
                this.moderationStorage.delete(id);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            this.logger.log(`🧹 ${cleaned} ta eski moderatsiya tozalandi`);
        }
    }
    generateModerationId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `mod_${timestamp}_${random}`;
    }
    formatPhone(phone) {
        if (!phone)
            return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 12) {
            return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
        }
        return phone;
    }
    getInsuranceTypeText(type) {
        const types = {
            '24days': '24 kun',
            '6months': '6 oy',
            '1year': '1 yil',
            'custom': 'Maxsus sana'
        };
        return types[type] || type;
    }
    calculateKPI(insuranceType) {
        const kpiValues = {
            '24days': 5000,
            '6months': 10000,
            '1year': 15000,
            'custom': 5000
        };
        return kpiValues[insuranceType] || 5000;
    }
};
exports.ModerationService = ModerationService;
exports.ModerationService = ModerationService = ModerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(car_entity_1.Car)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(insurance_entity_1.CarInsurance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        bot_service_1.BotService])
], ModerationService);
//# sourceMappingURL=moderation.service.js.map
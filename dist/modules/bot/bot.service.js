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
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const kpi_entity_1 = require("../../database/entities/kpi.entity");
const config_service_1 = require("../../config/config.service");
const telegraf_1 = require("telegraf");
const nestjs_telegraf_1 = require("nestjs-telegraf");
let BotService = class BotService {
    constructor(bot, userRepo, kpiRepo, configService) {
        this.bot = bot;
        this.userRepo = userRepo;
        this.kpiRepo = kpiRepo;
        this.configService = configService;
        console.log('🤖 BotService yaratildi');
    }
    async findOrCreateUser(telegramUser) {
        const telegramId = String(telegramUser.id);
        console.log('👤 Telegram ID:', telegramId);
        let user = await this.userRepo.findOne({
            where: { telegramId }
        });
        if (!user) {
            const adminIds = this.configService.adminIds.map(id => String(id));
            console.log('📋 Admin IDs (string):', adminIds);
            console.log('🔍 Is admin?', adminIds.includes(telegramId));
            const role = adminIds.includes(telegramId) ? 'admin' : 'registrar';
            console.log('🎯 Assigned role:', role);
            const newUser = new user_entity_1.User();
            newUser.telegramId = telegramId;
            newUser.username = telegramUser.username;
            newUser.firstName = telegramUser.first_name;
            newUser.lastName = telegramUser.last_name;
            newUser.role = role;
            newUser.isActive = true;
            user = await this.userRepo.save(newUser);
            console.log('✅ Yangi user yaratildi:', user);
        }
        else {
            console.log('👤 Mavjud user:', {
                id: user.id,
                telegramId: user.telegramId,
                role: user.role,
                firstName: user.firstName
            });
        }
        return user;
    }
    async addKpi(userId, amount, action, referenceId) {
        const kpi = new kpi_entity_1.Kpi();
        kpi.userId = userId;
        kpi.actionType = action;
        kpi.points = 1;
        kpi.amount = amount;
        kpi.referenceId = referenceId;
        kpi.referenceType = action;
        return this.kpiRepo.save(kpi);
    }
    async updateUserRole(telegramId, newRole) {
        const user = await this.userRepo.findOne({
            where: { telegramId }
        });
        if (!user) {
            throw new Error('User topilmadi');
        }
        const oldRole = user.role;
        user.role = newRole;
        const updatedUser = await this.userRepo.save(user);
        await this.notifyAdminsAboutRoleChange(updatedUser, oldRole, newRole, 'System');
        return updatedUser;
    }
    async getAllUsers() {
        return this.userRepo.find({
            select: ['id', 'telegramId', 'firstName', 'username', 'role', 'isActive']
        });
    }
    async deactivateUser(telegramId, deactivatedBy) {
        const user = await this.userRepo.findOne({ where: { telegramId } });
        if (!user)
            throw new Error('User topilmadi');
        await this.userRepo.update({ telegramId }, { isActive: false });
        await this.notifyAdminsAboutUserStatus(user, false, deactivatedBy);
    }
    async activateUser(telegramId, activatedBy) {
        const user = await this.userRepo.findOne({ where: { telegramId } });
        if (!user)
            throw new Error('User topilmadi');
        await this.userRepo.update({ telegramId }, { isActive: true });
        await this.notifyAdminsAboutUserStatus(user, true, activatedBy);
    }
    getRules() {
        return '📋 <b>QOIDALAR:</b>\n\n' +
            '1️⃣ Avtomobil raqami: <code>01A123BB</code>\n' +
            '2️⃣ Telefon raqami: <code>998901234567</code>\n' +
            '3️⃣ Sug\'urta muddati: Kalendardan tanlanadi\n' +
            '4️⃣ 1 ta avtomobil = <b>2500 so\'m</b>\n' +
            '5️⃣ Takroriy raqam qo\'shilmaydi\n\n' +
            '👑 Admin bo\'lish uchun @service_admin ga murojaat qiling';
    }
    async sendMessage(telegramId, message, keyboard) {
        try {
            const options = {
                parse_mode: 'HTML'
            };
            if (keyboard) {
                if (keyboard && typeof keyboard === 'object') {
                    if (keyboard.reply_markup) {
                        options.reply_markup = keyboard.reply_markup;
                    }
                    else if (keyboard.inline_keyboard || keyboard.keyboard) {
                        options.reply_markup = keyboard;
                    }
                    else {
                        options.reply_markup = keyboard;
                    }
                }
                else {
                    options.reply_markup = keyboard;
                }
                console.log('📤 Xabar yuborilmoqda:', {
                    telegramId,
                    hasKeyboard: !!keyboard,
                    replyMarkup: JSON.stringify(options.reply_markup)
                });
            }
            await this.bot.telegram.sendMessage(telegramId, message, options);
            return true;
        }
        catch (error) {
            console.error(`❌ Error sending message to ${telegramId}:`, error.message);
            return false;
        }
    }
    async sendInlineKeyboard(telegramId, message, inlineKeyboard) {
        try {
            const keyboard = {
                inline_keyboard: inlineKeyboard
            };
            await this.bot.telegram.sendMessage(telegramId, message, {
                parse_mode: 'HTML',
                reply_markup: keyboard
            });
            return true;
        }
        catch (error) {
            console.error(`❌ Error sending inline keyboard to ${telegramId}:`, error.message);
            return false;
        }
    }
    async sendReplyKeyboard(telegramId, message, buttons, resizeKeyboard = true) {
        try {
            const keyboard = {
                keyboard: buttons,
                resize_keyboard: resizeKeyboard
            };
            await this.bot.telegram.sendMessage(telegramId, message, {
                parse_mode: 'HTML',
                reply_markup: keyboard
            });
            return true;
        }
        catch (error) {
            console.error(`❌ Error sending reply keyboard to ${telegramId}:`, error.message);
            return false;
        }
    }
    async sendHtmlMessage(telegramId, message) {
        return this.sendMessage(telegramId, message);
    }
    async sendToAdmins(message) {
        try {
            const admins = await this.userRepo.find({
                where: { role: 'admin', isActive: true }
            });
            for (const admin of admins) {
                if (admin.telegramId) {
                    await this.sendMessage(admin.telegramId, message);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        catch (error) {
            console.error('❌ Error sending to admins:', error);
        }
    }
    async notifyAdminsAboutRoleChange(user, oldRole, newRole, changedBy) {
        const roleIcons = {
            'admin': '👑',
            'operator': '🎮',
            'registrar': '📋'
        };
        const message = `━━━━━━━━━━━━━━━━━━\n` +
            `🔄 <b>ROL O'ZGARTIRILDI!</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `👤 Foydalanuvchi: <b>${user.firstName || user.username || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
            `📋 Eski rol: ${roleIcons[oldRole] || '👤'} ${oldRole}\n` +
            `📋 Yangi rol: ${roleIcons[newRole] || '👤'} <b>${newRole}</b>\n` +
            `👤 O'zgartirgan: @${changedBy || 'System'}\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}\n` +
            `━━━━━━━━━━━━━━━━━━`;
        await this.sendToAdmins(message);
    }
    async notifyAdminsAboutUserStatus(user, isActive, changedBy) {
        const statusText = isActive ? 'faollashtirildi' : 'bloklandi';
        const statusIcon = isActive ? '✅' : '❌';
        const roleIcons = {
            'admin': '👑',
            'operator': '🎮',
            'registrar': '📋'
        };
        const message = `━━━━━━━━━━━━━━━━━━\n` +
            `${statusIcon} <b>FOYDALANUVCHI ${statusText.toUpperCase()}!</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `👤 Foydalanuvchi: <b>${user.firstName || user.username || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
            `📋 Rol: ${roleIcons[user.role] || '👤'} ${user.role}\n` +
            `👤 O'zgartirgan: @${changedBy || 'System'}\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}\n` +
            `━━━━━━━━━━━━━━━━━━`;
        await this.sendToAdmins(message);
    }
    async notifyAboutNewCar(car, addedBy) {
        const secondPlateText = car.secondPlateNumber ? `\n➕ Ikkinchi raqam: <b>${car.secondPlateNumber}</b>` : '';
        const photosText = (car.techPhoto && car.carPhoto) ? '✅ Ikkala rasm' :
            (car.techPhoto || car.carPhoto) ? '⚠️ Bitta rasm' : '❌ Rasmsiz';
        const message = `━━━━━━━━━━━━━━━━━━\n` +
            `🚗 <b>YANGI AVTOMOBIL QO'SHILDI!</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `🚘 Asosiy raqam: <b>${car.plateNumber}</b>${secondPlateText}\n` +
            `👤 Avtomobil egasi: <b>${car.ownerName}</b>\n` +
            `📞 Telefon: <code>${car.ownerPhone}</code>\n` +
            `📸 Rasmlar: ${photosText}\n` +
            `👤 Qo'shgan: <b>${addedBy.firstName || addedBy.username}</b> (${this.getRoleIcon(addedBy.role)} ${addedBy.role})\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}\n` +
            `━━━━━━━━━━━━━━━━━━`;
        await this.sendToAdmins(message);
    }
    async notifyAboutClosedLead(lead, closedBy, amount) {
        const leadTypeIcons = {
            'HOT': '🔥',
            'WARM': '🌤',
            'COLD': '❄️'
        };
        const message = `━━━━━━━━━━━━━━━━━━\n` +
            `💰 <b>LEAD YOPILDI!</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `🚗 Avtomobil: <b>${lead.car?.plateNumber || 'Noma\'lum'}</b>\n` +
            `👤 Mijoz: ${lead.car?.ownerName || 'Noma\'lum'}\n` +
            `📞 Tel: ${lead.car?.ownerPhone || 'Noma\'lum'}\n` +
            `🔥 Turi: ${leadTypeIcons[lead.type] || ''} ${lead.type || 'Standart'}\n` +
            `💰 KPI: <b>${amount.toLocaleString()} so'm</b>\n` +
            `👤 Yopgan: <b>${closedBy.firstName || closedBy.username}</b> (${this.getRoleIcon(closedBy.role)} ${closedBy.role})\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}\n` +
            `━━━━━━━━━━━━━━━━━━`;
        await this.sendToAdmins(message);
    }
    async notifyAboutExpiringInsurance(car, daysLeft) {
        const emoji = daysLeft <= 3 ? '🔥' : daysLeft <= 7 ? '⚠️' : '📅';
        const message = `━━━━━━━━━━━━━━━━━━\n` +
            `${emoji} <b>SUG'URTA MUDDATI TUGASHIGA ${daysLeft} KUN QOLDI!</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `🚗 Avtomobil: <b>${car.plateNumber}</b>\n` +
            `👤 Ega: ${car.ownerName}\n` +
            `📞 Tel: ${car.ownerPhone}\n` +
            `📅 Tugash sanasi: ${new Date(car.insuranceEndDate).toLocaleDateString('uz-UZ')}\n` +
            `⏳ Qolgan kun: <b>${daysLeft} kun</b>\n` +
            `👤 Registrar: ${car.registeredBy?.firstName || 'Noma\'lum'}\n` +
            `━━━━━━━━━━━━━━━━━━`;
        await this.sendToAdmins(message);
    }
    async notifyAboutNewAdmin(user, addedBy) {
        const message = `━━━━━━━━━━━━━━━━━━\n` +
            `👑 <b>YANGI ADMIN QO'SHILDI!</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `🎉 <b>${user.firstName || user.username}</b> endi Admin!\n\n` +
            `👤 Ism: <b>${user.firstName || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
            `👤 Qo'shgan: @${addedBy}\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}\n` +
            `━━━━━━━━━━━━━━━━━━`;
        await this.sendToAdmins(message);
    }
    async notifyAboutNewOperator(user, addedBy) {
        const message = `━━━━━━━━━━━━━━━━━━\n` +
            `🎮 <b>YANGI OPERATOR QO'SHILDI!</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `🎉 <b>${user.firstName || user.username}</b> endi Operator!\n\n` +
            `👤 Ism: <b>${user.firstName || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
            `👤 Qo'shgan: @${addedBy}\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}\n` +
            `━━━━━━━━━━━━━━━━━━`;
        await this.sendToAdmins(message);
    }
    async notifyAboutNewRegistrar(user, addedBy) {
        const message = `━━━━━━━━━━━━━━━━━━\n` +
            `📋 <b>YANGI REGISTRATOR QO'SHILDI!</b>\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `🎉 <b>${user.firstName || user.username}</b> endi Registrar!\n\n` +
            `👤 Ism: <b>${user.firstName || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
            `👤 Qo'shgan: @${addedBy}\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}\n` +
            `━━━━━━━━━━━━━━━━━━`;
        await this.sendToAdmins(message);
    }
    getRoleIcon(role) {
        const icons = {
            'admin': '👑',
            'operator': '🎮',
            'registrar': '📋'
        };
        return icons[role] || '👤';
    }
};
exports.BotService = BotService;
exports.BotService = BotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(kpi_entity_1.Kpi)),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_service_1.ConfigService])
], BotService);
//# sourceMappingURL=bot.service.js.map
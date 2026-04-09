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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../database/entities/user.entity");
const bot_service_1 = require("../bot/bot.service");
let UserService = class UserService {
    constructor(userRepo, botService) {
        this.userRepo = userRepo;
        this.botService = botService;
    }
    async findAll() {
        return this.userRepo.find({
            order: { createdAt: 'DESC' }
        });
    }
    async findOne(id) {
        return this.userRepo.findOne({ where: { id } });
    }
    async findByTelegramId(telegramId) {
        return this.userRepo.findOne({ where: { telegramId } });
    }
    async create(userData) {
        const user = this.userRepo.create(userData);
        const savedUser = await this.userRepo.save(user);
        await this.notifyAdminsAboutNewUser(savedUser);
        return savedUser;
    }
    async update(id, userData) {
        await this.userRepo.update(id, userData);
        return this.findOne(id);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepo.update(id, { isActive: false });
        await this.notifyAdminsAboutUserRemoval(user, 'System');
    }
    async updateRole(id, newRole, updatedBy) {
        const user = await this.findOne(id);
        if (!user)
            throw new Error('User not found');
        const oldRole = user.role;
        await this.userRepo.update(id, { role: newRole });
        const updatedUser = await this.findOne(id);
        await this.notifyAdminsAboutRoleChange(updatedUser, oldRole, newRole, updatedBy);
        return updatedUser;
    }
    async addAdmin(telegramId, addedBy) {
        const user = await this.findByTelegramId(telegramId);
        if (!user)
            throw new Error('User not found');
        const oldRole = user.role;
        await this.userRepo.update(user.id, { role: 'admin' });
        const updatedUser = await this.findOne(user.id);
        await this.notifyAdminsAboutNewAdmin(updatedUser, oldRole, addedBy);
        return updatedUser;
    }
    async addOperator(telegramId, addedBy) {
        const user = await this.findByTelegramId(telegramId);
        if (!user)
            throw new Error('User not found');
        const oldRole = user.role;
        await this.userRepo.update(user.id, { role: 'operator' });
        const updatedUser = await this.findOne(user.id);
        await this.notifyAdminsAboutNewOperator(updatedUser, oldRole, addedBy);
        return updatedUser;
    }
    async addRegistrar(telegramId, addedBy) {
        const user = await this.findByTelegramId(telegramId);
        if (!user)
            throw new Error('User not found');
        const oldRole = user.role;
        await this.userRepo.update(user.id, { role: 'registrar' });
        const updatedUser = await this.findOne(user.id);
        await this.notifyAdminsAboutNewRegistrar(updatedUser, oldRole, addedBy);
        return updatedUser;
    }
    async getByRole(role) {
        return this.userRepo.find({
            where: { role, isActive: true },
            order: { firstName: 'ASC' }
        });
    }
    async getAdmins() {
        return this.getByRole('admin');
    }
    async getOperators() {
        return this.getByRole('operator');
    }
    async getRegistrars() {
        return this.getByRole('registrar');
    }
    async getCountByRole(role) {
        return this.userRepo.count({ where: { role, isActive: true } });
    }
    async getUsersCountByRole() {
        const [admin, operator, registrar] = await Promise.all([
            this.getCountByRole('admin'),
            this.getCountByRole('operator'),
            this.getCountByRole('registrar')
        ]);
        return { admin, operator, registrar };
    }
    async getActiveUsers() {
        return this.userRepo.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' }
        });
    }
    async getActiveUsersCount() {
        return this.userRepo.count({ where: { isActive: true } });
    }
    async setUserStatus(telegramId, isActive, changedBy) {
        const user = await this.findByTelegramId(telegramId);
        if (!user)
            throw new Error('User not found');
        await this.userRepo.update({ telegramId }, { isActive });
        const updatedUser = await this.findByTelegramId(telegramId);
        const statusText = isActive ? '✅ faollashtirildi' : '❌ bloklandi';
        const message = `🔄 <b>FOYDALANUVCHI ${statusText}</b>\n\n` +
            `👤 Foydalanuvchi: <b>${user.firstName || user.username || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📋 Rol: ${this.getRoleIcon(user.role)} ${user.role}\n` +
            `👤 O'zgartirgan: @${changedBy || 'System'}\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToAdmins(message);
        return updatedUser;
    }
    async getAllUsers() {
        const users = await this.userRepo.find({
            select: [
                'id',
                'telegramId',
                'firstName',
                'lastName',
                'username',
                'role',
                'isActive',
                'phone',
                'createdAt'
            ],
            order: { createdAt: 'DESC' }
        });
        return users;
    }
    async getRecentUsers(limit = 10) {
        return this.userRepo.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
            take: limit
        });
    }
    async getUserStats() {
        const [total, active, registrars, operators, admins] = await Promise.all([
            this.userRepo.count(),
            this.userRepo.count({ where: { isActive: true } }),
            this.userRepo.count({ where: { role: 'registrar', isActive: true } }),
            this.userRepo.count({ where: { role: 'operator', isActive: true } }),
            this.userRepo.count({ where: { role: 'admin', isActive: true } })
        ]);
        return {
            total,
            active,
            registrars,
            operators,
            admins,
            inactive: total - active
        };
    }
    async searchUsers(query) {
        if (!query || query.length < 2)
            return [];
        return this.userRepo
            .createQueryBuilder('user')
            .where('user.firstName ILIKE :query', { query: `%${query}%` })
            .orWhere('user.lastName ILIKE :query', { query: `%${query}%` })
            .orWhere('user.username ILIKE :query', { query: `%${query}%` })
            .orWhere('user.phone ILIKE :query', { query: `%${query}%` })
            .orWhere('user.telegramId ILIKE :query', { query: `%${query}%` })
            .orderBy('user.createdAt', 'DESC')
            .getMany();
    }
    async bulkDelete(userIds, deletedBy) {
        if (!userIds || userIds.length === 0)
            return 0;
        const users = await this.getUsersByIds(userIds);
        const result = await this.userRepo.update({ id: (0, typeorm_2.In)(userIds) }, { isActive: false });
        for (const user of users) {
            await this.notifyAdminsAboutUserRemoval(user, deletedBy || 'System');
        }
        return result.affected || 0;
    }
    async bulkUpdateRole(userIds, newRole, updatedBy) {
        if (!userIds || userIds.length === 0)
            return 0;
        const users = await this.getUsersByIds(userIds);
        const result = await this.userRepo.update({ id: (0, typeorm_2.In)(userIds) }, { role: newRole });
        for (const user of users) {
            await this.notifyAdminsAboutRoleChange(user, user.role, newRole, updatedBy);
        }
        return result.affected || 0;
    }
    async getUsersByIds(userIds) {
        if (!userIds || userIds.length === 0)
            return [];
        return this.userRepo.find({
            where: { id: (0, typeorm_2.In)(userIds) },
            order: { firstName: 'ASC' }
        });
    }
    async findByTelegramIds(telegramIds) {
        if (!telegramIds || telegramIds.length === 0)
            return [];
        return this.userRepo.find({
            where: { telegramId: (0, typeorm_2.In)(telegramIds) },
            order: { firstName: 'ASC' }
        });
    }
    async exists(telegramId) {
        const count = await this.userRepo.count({ where: { telegramId } });
        return count > 0;
    }
    async activateUser(telegramId, activatedBy) {
        return this.setUserStatus(telegramId, true, activatedBy);
    }
    async deactivateUser(telegramId, deactivatedBy) {
        return this.setUserStatus(telegramId, false, deactivatedBy);
    }
    async notifyAdminsAboutNewUser(user) {
        const message = `🆕 <b>YANGI FOYDALANUVCHI QO'SHILDI!</b>\n\n` +
            `👤 Ism: <b>${user.firstName || user.username || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
            `📋 Rol: ${this.getRoleIcon(user.role)} <b>${user.role}</b>\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToAdmins(message);
    }
    async notifyAdminsAboutRoleChange(user, oldRole, newRole, changedBy) {
        const message = `🔄 <b>ROL O'ZGARTIRILDI!</b>\n\n` +
            `👤 Foydalanuvchi: <b>${user.firstName || user.username || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
            `📋 Eski rol: ${this.getRoleIcon(oldRole)} ${oldRole}\n` +
            `📋 Yangi rol: ${this.getRoleIcon(newRole)} <b>${newRole}</b>\n` +
            `👤 O'zgartirgan: @${changedBy || 'Admin'}\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToAdmins(message);
    }
    async notifyAdminsAboutNewAdmin(user, oldRole, addedBy) {
        const message = `👑 <b>YANGI ADMIN QO'SHILDI!</b>\n\n` +
            `🎉 <b>${user.firstName || user.username}</b> endi Admin!\n\n` +
            `👤 Ism: <b>${user.firstName || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
            `📋 Eski rol: ${this.getRoleIcon(oldRole)} ${oldRole}\n` +
            `👤 Qo'shgan: @${addedBy || 'Admin'}\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToAdmins(message);
    }
    async notifyAdminsAboutNewOperator(user, oldRole, addedBy) {
        const message = `🎮 <b>YANGI OPERATOR QO'SHILDI!</b>\n\n` +
            `🎉 <b>${user.firstName || user.username}</b> endi Operator!\n\n` +
            `👤 Ism: <b>${user.firstName || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
            `📋 Eski rol: ${this.getRoleIcon(oldRole)} ${oldRole}\n` +
            `👤 Qo'shgan: @${addedBy || 'Admin'}\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToAdmins(message);
    }
    async notifyAdminsAboutNewRegistrar(user, oldRole, addedBy) {
        const message = `📋 <b>YANGI REGISTRATOR QO'SHILDI!</b>\n\n` +
            `🎉 <b>${user.firstName || user.username}</b> endi Registrar!\n\n` +
            `👤 Ism: <b>${user.firstName || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
            `📋 Eski rol: ${this.getRoleIcon(oldRole)} ${oldRole}\n` +
            `👤 Qo'shgan: @${addedBy || 'Admin'}\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToAdmins(message);
    }
    async notifyAdminsAboutUserRemoval(user, removedBy) {
        const message = `❌ <b>FOYDALANUVCHI O'CHIRILDI!</b>\n\n` +
            `👤 Ism: <b>${user.firstName || user.username || 'Noma\'lum'}</b>\n` +
            `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
            `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
            `📋 Rol: ${this.getRoleIcon(user.role)} ${user.role}\n` +
            `👤 O'chirgan: @${removedBy}\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToAdmins(message);
    }
    async notifyAdminsAboutClosedLead(lead, closedBy, amount) {
        const leadTypeIcons = {
            'HOT': '🔥',
            'WARM': '🌤',
            'COLD': '❄️'
        };
        const message = `💰 <b>LEAD YOPILDI!</b>\n\n` +
            `🚗 Avtomobil: <b>${lead.car?.plateNumber || 'Noma\'lum'}</b>\n` +
            `👤 Mijoz: ${lead.car?.ownerName || 'Noma\'lum'}\n` +
            `📞 Tel: ${lead.car?.ownerPhone || 'Noma\'lum'}\n` +
            `🔥 Turi: ${leadTypeIcons[lead.leadType] || ''} ${lead.leadType || 'Standart'}\n` +
            `💰 Summa: <b>${amount.toLocaleString()} so'm</b>\n` +
            `👤 Yopgan: <b>${closedBy.firstName || closedBy.username}</b> (${this.getRoleIcon(closedBy.role)} ${closedBy.role})\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToAdmins(message);
    }
    async notifyAdminsAboutNewCar(car, addedBy) {
        const secondPlateText = car.secondPlateNumber ? `\n➕ Ikkinchi raqam: <b>${car.secondPlateNumber}</b>` : '';
        const message = `🚗 <b>YANGI AVTOMOBIL QO'SHILDI!</b>\n\n` +
            `🚘 Asosiy raqam: <b>${car.plateNumber}</b>` +
            `${secondPlateText}\n` +
            `👤 Ega: <b>${car.ownerName}</b>\n` +
            `📞 Tel: <b>${car.ownerPhone}</b>\n` +
            `📸 Tex pasport: ${car.techPhoto ? '✅' : '❌'}\n` +
            `📸 Mashina rasmi: ${car.carPhoto ? '✅' : '❌'}\n` +
            `📅 Sug'urta turi: ${car.insuranceType || 'Standart'}\n` +
            `👤 Qo'shgan: <b>${addedBy.firstName || addedBy.username}</b> (${this.getRoleIcon(addedBy.role)})\n` +
            `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
        await this.sendToAdmins(message);
    }
    async notifyAdminsAboutExpiringInsurance(car, daysLeft) {
        const emoji = daysLeft <= 3 ? '🔥' : daysLeft <= 7 ? '⚠️' : '📅';
        const message = `${emoji} <b>SUG'URTA MUDDATI TUGASHIGA ${daysLeft} KUN QOLDI!</b>\n\n` +
            `🚗 Avtomobil: <b>${car.plateNumber}</b>\n` +
            `👤 Ega: ${car.ownerName}\n` +
            `📞 Tel: ${car.ownerPhone}\n` +
            `📅 Tugash sanasi: ${new Date(car.insuranceEndDate).toLocaleDateString('uz-UZ')}\n` +
            `⏳ Qolgan kun: <b>${daysLeft} kun</b>\n` +
            `👤 Registrar: ${car.registeredBy?.firstName || 'Noma\'lum'}`;
        await this.sendToAdmins(message);
    }
    async sendToAdmins(message) {
        try {
            const admins = await this.getAdmins();
            for (const admin of admins) {
                if (admin.telegramId) {
                    await this.botService.sendMessage(admin.telegramId, message);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        catch (error) {
            console.error('Error sending notification to admins:', error);
        }
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
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        bot_service_1.BotService])
], UserService);
//# sourceMappingURL=user.service.js.map
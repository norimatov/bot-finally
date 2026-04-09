import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { BotService } from '../bot/bot.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private botService: BotService, // BotService inject qilish
  ) {}

  // ============== ASOSIY METODLAR ==============
  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<User> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByTelegramId(telegramId: string): Promise<User> {
    return this.userRepo.findOne({ where: { telegramId } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepo.create(userData);
    const savedUser = await this.userRepo.save(user);
    
    // Yangi user qo'shilganda adminlarga xabar
    await this.notifyAdminsAboutNewUser(savedUser);
    
    return savedUser;
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.userRepo.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.update(id, { isActive: false });
    
    // User o'chirilganda adminlarga xabar
    await this.notifyAdminsAboutUserRemoval(user, 'System');
  }

  // ============== ROL BILAN ISHLASH (BILDIRISHNOMALAR BILAN) ==============
  
  /**
   * Rolni yangilash va adminlarga xabar yuborish
   */
  async updateRole(id: number, newRole: string, updatedBy?: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new Error('User not found');
    
    const oldRole = user.role;
    
    // Rolni yangilash
    await this.userRepo.update(id, { role: newRole });
    const updatedUser = await this.findOne(id);
    
    // Rol o'zgargani haqida adminlarga xabar
    await this.notifyAdminsAboutRoleChange(updatedUser, oldRole, newRole, updatedBy);
    
    return updatedUser;
  }

  /**
   * Admin qo'shish (maxsus metod)
   */
  async addAdmin(telegramId: string, addedBy?: string): Promise<User> {
    const user = await this.findByTelegramId(telegramId);
    if (!user) throw new Error('User not found');
    
    const oldRole = user.role;
    
    // Rolni admin qilish
    await this.userRepo.update(user.id, { role: 'admin' });
    const updatedUser = await this.findOne(user.id);
    
    // Yangi admin qo'shilgani haqida xabar
    await this.notifyAdminsAboutNewAdmin(updatedUser, oldRole, addedBy);
    
    return updatedUser;
  }

  /**
   * Operator qo'shish (maxsus metod)
   */
  async addOperator(telegramId: string, addedBy?: string): Promise<User> {
    const user = await this.findByTelegramId(telegramId);
    if (!user) throw new Error('User not found');
    
    const oldRole = user.role;
    
    // Rolni operator qilish
    await this.userRepo.update(user.id, { role: 'operator' });
    const updatedUser = await this.findOne(user.id);
    
    // Yangi operator qo'shilgani haqida xabar
    await this.notifyAdminsAboutNewOperator(updatedUser, oldRole, addedBy);
    
    return updatedUser;
  }

  /**
   * Registrar qo'shish (maxsus metod)
   */
  async addRegistrar(telegramId: string, addedBy?: string): Promise<User> {
    const user = await this.findByTelegramId(telegramId);
    if (!user) throw new Error('User not found');
    
    const oldRole = user.role;
    
    // Rolni registrar qilish
    await this.userRepo.update(user.id, { role: 'registrar' });
    const updatedUser = await this.findOne(user.id);
    
    // Yangi registrar qo'shilgani haqida xabar
    await this.notifyAdminsAboutNewRegistrar(updatedUser, oldRole, addedBy);
    
    return updatedUser;
  }

  async getByRole(role: string): Promise<User[]> {
    return this.userRepo.find({ 
      where: { role, isActive: true },
      order: { firstName: 'ASC' }
    });
  }

  /**
   * 🔥 Rollar bo'yicha userlarni olish
   */
  async getAdmins(): Promise<User[]> {
    return this.getByRole('admin');
  }

  async getOperators(): Promise<User[]> {
    return this.getByRole('operator');
  }

  async getRegistrars(): Promise<User[]> {
    return this.getByRole('registrar');
  }

  async getCountByRole(role: string): Promise<number> {
    return this.userRepo.count({ where: { role, isActive: true } });
  }

  /**
   * 🔥 Rollar bo'yicha statistikani olish
   */
  async getUsersCountByRole(): Promise<{ admin: number; operator: number; registrar: number }> {
    const [admin, operator, registrar] = await Promise.all([
      this.getCountByRole('admin'),
      this.getCountByRole('operator'),
      this.getCountByRole('registrar')
    ]);
    
    return { admin, operator, registrar };
  }

  // ============== AKTIVLIK BILAN ISHLASH ==============
  async getActiveUsers(): Promise<User[]> {
    return this.userRepo.find({ 
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async getActiveUsersCount(): Promise<number> {
    return this.userRepo.count({ where: { isActive: true } });
  }

  async setUserStatus(telegramId: string, isActive: boolean, changedBy?: string): Promise<User> {
    const user = await this.findByTelegramId(telegramId);
    if (!user) throw new Error('User not found');
    
    await this.userRepo.update({ telegramId }, { isActive });
    const updatedUser = await this.findByTelegramId(telegramId);
    
    // Status o'zgargani haqida xabar
    const statusText = isActive ? '✅ faollashtirildi' : '❌ bloklandi';
    const message = 
      `🔄 <b>FOYDALANUVCHI ${statusText}</b>\n\n` +
      `👤 Foydalanuvchi: <b>${user.firstName || user.username || 'Noma\'lum'}</b>\n` +
      `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
      `📋 Rol: ${this.getRoleIcon(user.role)} ${user.role}\n` +
      `👤 O'zgartirgan: @${changedBy || 'System'}\n` +
      `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;
    
    await this.sendToAdmins(message);
    
    return updatedUser;
  }

  // ============== USERLAR RO'YXATI ==============
  async getAllUsers(): Promise<Partial<User>[]> {
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

  async getRecentUsers(limit: number = 10): Promise<User[]> {
    return this.userRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  // ============== STATISTIKA ==============
  async getUserStats(): Promise<any> {
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

  // ============== QIDIRISH ==============
  async searchUsers(query: string): Promise<User[]> {
    if (!query || query.length < 2) return [];
    
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

  // ============== BIR NECHTA USER BILAN ISHLASH ==============
  async bulkDelete(userIds: number[], deletedBy?: string): Promise<number> {
    if (!userIds || userIds.length === 0) return 0;
    
    const users = await this.getUsersByIds(userIds);
    
    const result = await this.userRepo.update(
      { id: In(userIds) },
      { isActive: false }
    );
    
    // Har bir user uchun xabar yuborish
    for (const user of users) {
      await this.notifyAdminsAboutUserRemoval(user, deletedBy || 'System');
    }
    
    return result.affected || 0;
  }

  async bulkUpdateRole(userIds: number[], newRole: string, updatedBy?: string): Promise<number> {
    if (!userIds || userIds.length === 0) return 0;
    
    const users = await this.getUsersByIds(userIds);
    
    const result = await this.userRepo.update(
      { id: In(userIds) },
      { role: newRole }
    );
    
    // Har bir user uchun xabar yuborish
    for (const user of users) {
      await this.notifyAdminsAboutRoleChange(user, user.role, newRole, updatedBy);
    }
    
    return result.affected || 0;
  }

  async getUsersByIds(userIds: number[]): Promise<User[]> {
    if (!userIds || userIds.length === 0) return [];
    
    return this.userRepo.find({
      where: { id: In(userIds) },
      order: { firstName: 'ASC' }
    });
  }

  // ============== TELEGRAM ID BO'YICHA ==============
  async findByTelegramIds(telegramIds: string[]): Promise<User[]> {
    if (!telegramIds || telegramIds.length === 0) return [];
    
    return this.userRepo.find({
      where: { telegramId: In(telegramIds) },
      order: { firstName: 'ASC' }
    });
  }

  // ============== USER MAVJUDLIGINI TEKSHIRISH ==============
  async exists(telegramId: string): Promise<boolean> {
    const count = await this.userRepo.count({ where: { telegramId } });
    return count > 0;
  }

  // ============== USER NI AKTIVLIK HOLATINI O'ZGARTIRISH ==============
  async activateUser(telegramId: string, activatedBy?: string): Promise<User> {
    return this.setUserStatus(telegramId, true, activatedBy);
  }

  async deactivateUser(telegramId: string, deactivatedBy?: string): Promise<User> {
    return this.setUserStatus(telegramId, false, deactivatedBy);
  }

  //! ============== BILDIRISHNOMA (NOTIFICATION) METODLARI ==============
  // 🔥 BARCHA METODLAR ENDI PUBLIC!

  /**
   * Yangi user qo'shilganda adminlarga xabar
   */
  async notifyAdminsAboutNewUser(user: User) {
    const message = 
      `🆕 <b>YANGI FOYDALANUVCHI QO'SHILDI!</b>\n\n` +
      `👤 Ism: <b>${user.firstName || user.username || 'Noma\'lum'}</b>\n` +
      `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
      `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
      `📋 Rol: ${this.getRoleIcon(user.role)} <b>${user.role}</b>\n` +
      `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;

    await this.sendToAdmins(message);
  }

  /**
   * Rol o'zgarganida adminlarga xabar
   */
  async notifyAdminsAboutRoleChange(user: User, oldRole: string, newRole: string, changedBy?: string) {
    const message = 
      `🔄 <b>ROL O'ZGARTIRILDI!</b>\n\n` +
      `👤 Foydalanuvchi: <b>${user.firstName || user.username || 'Noma\'lum'}</b>\n` +
      `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
      `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
      `📋 Eski rol: ${this.getRoleIcon(oldRole)} ${oldRole}\n` +
      `📋 Yangi rol: ${this.getRoleIcon(newRole)} <b>${newRole}</b>\n` +
      `👤 O'zgartirgan: @${changedBy || 'Admin'}\n` +
      `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;

    await this.sendToAdmins(message);
  }

  /**
   * Yangi admin qo'shilganda xabar
   */
  async notifyAdminsAboutNewAdmin(user: User, oldRole: string, addedBy?: string) {
    const message = 
      `👑 <b>YANGI ADMIN QO'SHILDI!</b>\n\n` +
      `🎉 <b>${user.firstName || user.username}</b> endi Admin!\n\n` +
      `👤 Ism: <b>${user.firstName || 'Noma\'lum'}</b>\n` +
      `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
      `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
      `📋 Eski rol: ${this.getRoleIcon(oldRole)} ${oldRole}\n` +
      `👤 Qo'shgan: @${addedBy || 'Admin'}\n` +
      `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;

    await this.sendToAdmins(message);
  }

  /**
   * Yangi operator qo'shilganda xabar
   */
  async notifyAdminsAboutNewOperator(user: User, oldRole: string, addedBy?: string) {
    const message = 
      `🎮 <b>YANGI OPERATOR QO'SHILDI!</b>\n\n` +
      `🎉 <b>${user.firstName || user.username}</b> endi Operator!\n\n` +
      `👤 Ism: <b>${user.firstName || 'Noma\'lum'}</b>\n` +
      `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
      `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
      `📋 Eski rol: ${this.getRoleIcon(oldRole)} ${oldRole}\n` +
      `👤 Qo'shgan: @${addedBy || 'Admin'}\n` +
      `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;

    await this.sendToAdmins(message);
  }

  /**
   * Yangi registrar qo'shilganda xabar
   */
  async notifyAdminsAboutNewRegistrar(user: User, oldRole: string, addedBy?: string) {
    const message = 
      `📋 <b>YANGI REGISTRATOR QO'SHILDI!</b>\n\n` +
      `🎉 <b>${user.firstName || user.username}</b> endi Registrar!\n\n` +
      `👤 Ism: <b>${user.firstName || 'Noma\'lum'}</b>\n` +
      `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
      `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
      `📋 Eski rol: ${this.getRoleIcon(oldRole)} ${oldRole}\n` +
      `👤 Qo'shgan: @${addedBy || 'Admin'}\n` +
      `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;

    await this.sendToAdmins(message);
  }

  /**
   * User o'chirilganda xabar
   */
  async notifyAdminsAboutUserRemoval(user: User, removedBy: string) {
    const message = 
      `❌ <b>FOYDALANUVCHI O'CHIRILDI!</b>\n\n` +
      `👤 Ism: <b>${user.firstName || user.username || 'Noma\'lum'}</b>\n` +
      `🆔 Telegram ID: <code>${user.telegramId}</code>\n` +
      `📞 Telefon: ${user.phone || 'Noma\'lum'}\n` +
      `📋 Rol: ${this.getRoleIcon(user.role)} ${user.role}\n` +
      `👤 O'chirgan: @${removedBy}\n` +
      `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;

    await this.sendToAdmins(message);
  }

  /**
   * Lead yopilganda xabar
   */
  async notifyAdminsAboutClosedLead(lead: any, closedBy: User, amount: number) {
    const leadTypeIcons = {
      'HOT': '🔥',
      'WARM': '🌤',
      'COLD': '❄️'
    };

    const message = 
      `💰 <b>LEAD YOPILDI!</b>\n\n` +
      `🚗 Avtomobil: <b>${lead.car?.plateNumber || 'Noma\'lum'}</b>\n` +
      `👤 Mijoz: ${lead.car?.ownerName || 'Noma\'lum'}\n` +
      `📞 Tel: ${lead.car?.ownerPhone || 'Noma\'lum'}\n` +
      `🔥 Turi: ${leadTypeIcons[lead.leadType] || ''} ${lead.leadType || 'Standart'}\n` +
      `💰 Summa: <b>${amount.toLocaleString()} so'm</b>\n` +
      `👤 Yopgan: <b>${closedBy.firstName || closedBy.username}</b> (${this.getRoleIcon(closedBy.role)} ${closedBy.role})\n` +
      `📅 Sana: ${new Date().toLocaleString('uz-UZ')}`;

    await this.sendToAdmins(message);
  }

  /**
   * Yangi avtomobil qo'shilganda xabar
   */
  async notifyAdminsAboutNewCar(car: any, addedBy: User) {
    const secondPlateText = car.secondPlateNumber ? `\n➕ Ikkinchi raqam: <b>${car.secondPlateNumber}</b>` : '';
    
    const message = 
      `🚗 <b>YANGI AVTOMOBIL QO'SHILDI!</b>\n\n` +
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

  /**
   * Sug'urta muddati tugashiga X kun qolganda xabar
   */
  async notifyAdminsAboutExpiringInsurance(car: any, daysLeft: number) {
    const emoji = daysLeft <= 3 ? '🔥' : daysLeft <= 7 ? '⚠️' : '📅';
    
    const message = 
      `${emoji} <b>SUG'URTA MUDDATI TUGASHIGA ${daysLeft} KUN QOLDI!</b>\n\n` +
      `🚗 Avtomobil: <b>${car.plateNumber}</b>\n` +
      `👤 Ega: ${car.ownerName}\n` +
      `📞 Tel: ${car.ownerPhone}\n` +
      `📅 Tugash sanasi: ${new Date(car.insuranceEndDate).toLocaleDateString('uz-UZ')}\n` +
      `⏳ Qolgan kun: <b>${daysLeft} kun</b>\n` +
      `👤 Registrar: ${car.registeredBy?.firstName || 'Noma\'lum'}`;

    await this.sendToAdmins(message);
  }

  /**
   * Barcha adminlarga xabar yuborish
   */
  private async sendToAdmins(message: string) {
    try {
      const admins = await this.getAdmins();
      
      for (const admin of admins) {
        if (admin.telegramId) {
          await this.botService.sendMessage(admin.telegramId, message);
          // Rate limiting - 1 sekund kutish
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error sending notification to admins:', error);
    }
  }

  /**
   * Rol ikonkasini olish
   */
  private getRoleIcon(role: string): string {
    const icons = {
      'admin': '👑',
      'operator': '🎮',
      'registrar': '📋'
    };
    return icons[role] || '👤';
  }
}
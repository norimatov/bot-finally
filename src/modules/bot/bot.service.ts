import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Kpi } from '../../database/entities/kpi.entity';
import { ConfigService } from '../../config/config.service';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';

export interface SendMessageOptions {
  reply_markup?: any;
  parse_mode?: 'HTML' | 'Markdown';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
}

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Kpi) private kpiRepo: Repository<Kpi>,
    private configService: ConfigService,
  ) {
    console.log('🤖 BotService yaratildi');
  }

  /**
   * 🔥 MODULE INIT - Botni ishga tushirish (409 Conflict xatosi uchun kuchaytirilgan versiya)
   */
  async onModuleInit() {
    try {
      const botToken = this.configService.get<string>('BOT_TOKEN');
      
      // 1. Avval botni to'xtatish (agar ishlayotgan bo'lsa)
      try {
        await this.bot.stop();
        console.log('⏹️ Bot to\'xtatildi');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (stopError) {
        const stopErrorMessage = stopError instanceof Error ? stopError.message : 'Noma\'lum xatolik';
        console.log('⚠️ Bot to\'xtatilmadi (ishlamayotgan bo\'lishi mumkin):', stopErrorMessage);
      }
      
      // 2. Webhook tozalash (drop_pending_updates bilan)
      if (botToken) {
        const deleteResponse = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook?drop_pending_updates=true`);
        const deleteData = await deleteResponse.json();
        if (deleteData.ok) {
          console.log('✅ Webhook tozalandi');
        } else {
          console.log('⚠️ Webhook tozalash javobi:', deleteData);
        }
        
        // 3. Kutilayotgan xabarlarni tozalash
        const getUpdatesResponse = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=-1&timeout=1`);
        const getUpdatesData = await getUpdatesResponse.json();
        if (getUpdatesData.ok) {
          console.log('📋 Kutilayotgan xabarlar tozalandi');
        }
        
        // 4. Bot to'liq to'xtashi uchun biroz kutish
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // 5. Botni ishga tushirish (dropPendingUpdates bilan)
      await this.bot.launch({
        dropPendingUpdates: true,
      });
      console.log('✅ Telegram bot ishga tushdi (long polling)');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
      console.error('❌ Bot ishga tushmadi:', errorMessage);
      
      // Agar 409 xatosi bo'lsa, qo'shimcha ma'lumot
      if (errorMessage.includes('409') || errorMessage.includes('Conflict')) {
        console.error('⚠️ 409 Conflict xatosi: Bot boshqa joyda ishlayotgan bo\'lishi mumkin!');
        console.error('   Yechim: Lokal botni to\'xtating yoki Render\'da Restart Service bosing');
        console.error('   Yoki BotFather dan /revoke qilib yangi token oling');
      }
    }
  }

  /**
   * Foydalanuvchini topish yoki yaratish
   */
  async findOrCreateUser(telegramUser: any): Promise<User> {
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

      const newUser = new User();
      newUser.telegramId = telegramId;
      newUser.username = telegramUser.username;
      newUser.firstName = telegramUser.first_name;
      newUser.lastName = telegramUser.last_name;
      newUser.role = role;
      newUser.isActive = true;

      user = await this.userRepo.save(newUser);
      console.log('✅ Yangi user yaratildi:', user);
    } else {
      console.log('👤 Mavjud user:', {
        id: user.id,
        telegramId: user.telegramId,
        role: user.role,
        firstName: user.firstName
      });
    }

    return user;
  }

  /**
   * KPI qo'shish
   */
  async addKpi(userId: number, amount: number, action: string, referenceId?: number): Promise<Kpi> {
    const kpi = new Kpi();
    kpi.userId = userId;
    kpi.actionType = action;
    kpi.points = 1;
    kpi.amount = amount;
    kpi.referenceId = referenceId;
    kpi.referenceType = action;
    return this.kpiRepo.save(kpi);
  }

  /**
   * User rolini yangilash
   */
  async updateUserRole(telegramId: string, newRole: string): Promise<User> {
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

  /**
   * Barcha userlarni olish
   */
  async getAllUsers(): Promise<User[]> {
    return this.userRepo.find({
      select: ['id', 'telegramId', 'firstName', 'username', 'role', 'isActive']
    });
  }

  /**
   * Userni bloklash
   */
  async deactivateUser(telegramId: string, deactivatedBy?: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { telegramId } });
    if (!user) throw new Error('User topilmadi');

    await this.userRepo.update(
      { telegramId },
      { isActive: false }
    );

    await this.notifyAdminsAboutUserStatus(user, false, deactivatedBy);
  }

  /**
   * Userni faollashtirish
   */
  async activateUser(telegramId: string, activatedBy?: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { telegramId } });
    if (!user) throw new Error('User topilmadi');

    await this.userRepo.update(
      { telegramId },
      { isActive: true }
    );

    await this.notifyAdminsAboutUserStatus(user, true, activatedBy);
  }

  /**
   * Qoidalarni olish
   */
  getRules(): string {
    return '📋 <b>QOIDALAR:</b>\n\n' +
      '1️⃣ Avtomobil raqami: <code>01A123BB</code>\n' +
      '2️⃣ Telefon raqami: <code>998901234567</code>\n' +
      '3️⃣ Sug\'urta muddati: Kalendardan tanlanadi\n' +
      '4️⃣ 1 ta avtomobil = <b>2500 so\'m</b>\n' +
      '5️⃣ Takroriy raqam qo\'shilmaydi\n\n' +
      '👑 Admin bo\'lish uchun @service_admin ga murojaat qiling';
  }

  /**
   * 🔥 YANGILANGAN: Xabar yuborish (overload - 2 argument)
   */
  async sendMessage(telegramId: string, message: string): Promise<boolean>;

  /**
   * 🔥 YANGILANGAN: Xabar yuborish (overload - 3 argument)
   */
  async sendMessage(telegramId: string, message: string, keyboard: any): Promise<boolean>;

  /**
   * 🔥 YANGILANGAN: Xabar yuborish (implementatsiya)
   * TUGMALARNI TO'G'RI ISHLATISH UCHUN YANGILANDI
   * 🔥 RASMLAR UCHUN link_preview_options QO'SHILDI (Telegraf yangi versiyasi uchun)
   */
  async sendMessage(telegramId: string, message: string, keyboard?: any): Promise<boolean> {
    try {
      const options: any = {
        parse_mode: 'HTML',
        // 🔥 YANGI: link_preview_options (disable_web_page_preview o'rniga)
        link_preview_options: {
          is_disabled: true,  // Web page preview ni o'chiradi
        },
      };

      if (keyboard) {
        // 🔥 MUHIM: keyboard ni to'g'ri formatda uzatish
        if (keyboard && typeof keyboard === 'object') {
          if (keyboard.reply_markup) {
            options.reply_markup = keyboard.reply_markup;
          } else if (keyboard.inline_keyboard || keyboard.keyboard) {
            options.reply_markup = keyboard;
          } else {
            options.reply_markup = keyboard;
          }
        } else {
          options.reply_markup = keyboard;
        }

        console.log('📤 Xabar yuborilmoqda:', {
          telegramId,
          hasKeyboard: !!keyboard,
        });
      }

      await this.bot.telegram.sendMessage(telegramId, message, options);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
      console.error(`❌ Error sending message to ${telegramId}:`, errorMessage);
      return false;
    }
  }

  /**
   * 🔥 YANGI: Inline tugmalar bilan xabar yuborish
   */
  async sendInlineKeyboard(telegramId: string, message: string, inlineKeyboard: any[][]): Promise<boolean> {
    try {
      const keyboard = {
        inline_keyboard: inlineKeyboard
      };

      await this.bot.telegram.sendMessage(telegramId, message, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: keyboard
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
      console.error(`❌ Error sending inline keyboard to ${telegramId}:`, errorMessage);
      return false;
    }
  }

  /**
   * 🔥 YANGI: Oddiy tugmalar bilan xabar yuborish
   */
  async sendReplyKeyboard(telegramId: string, message: string, buttons: string[][], resizeKeyboard: boolean = true): Promise<boolean> {
    try {
      const keyboard = {
        keyboard: buttons,
        resize_keyboard: resizeKeyboard
      };

      await this.bot.telegram.sendMessage(telegramId, message, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: keyboard
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
      console.error(`❌ Error sending reply keyboard to ${telegramId}:`, errorMessage);
      return false;
    }
  }

  /**
   * HTML formatda xabar yuborish
   */
  async sendHtmlMessage(telegramId: string, message: string): Promise<boolean> {
    return this.sendMessage(telegramId, message);
  }

  //! ============== BILDIRISHNOMA METODLARI ==============

  /**
   * Barcha adminlarga xabar yuborish
   */
  private async sendToAdmins(message: string) {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik';
      console.error('❌ Error sending to admins:', errorMessage);
    }
  }

  /**
   * Rol o'zgarishi haqida xabar
   */
  async notifyAdminsAboutRoleChange(user: User, oldRole: string, newRole: string, changedBy: string) {
    const roleIcons = {
      'admin': '👑',
      'operator': '🎮',
      'registrar': '📋'
    };

    const message =
      `━━━━━━━━━━━━━━━━━━\n` +
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

  /**
   * User statusi o'zgarishi haqida xabar
   */
  async notifyAdminsAboutUserStatus(user: User, isActive: boolean, changedBy: string) {
    const statusText = isActive ? 'faollashtirildi' : 'bloklandi';
    const statusIcon = isActive ? '✅' : '❌';
    const roleIcons = {
      'admin': '👑',
      'operator': '🎮',
      'registrar': '📋'
    };

    const message =
      `━━━━━━━━━━━━━━━━━━\n` +
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

  /**
   * Yangi avtomobil qo'shilganda xabar
   */
  async notifyAboutNewCar(car: any, addedBy: User) {
    const secondPlateText = car.secondPlateNumber ? `\n➕ Ikkinchi raqam: <b>${car.secondPlateNumber}</b>` : '';
    const photosText = (car.techPhoto && car.carPhoto) ? '✅ Ikkala rasm' :
      (car.techPhoto || car.carPhoto) ? '⚠️ Bitta rasm' : '❌ Rasmsiz';

    const message =
      `━━━━━━━━━━━━━━━━━━\n` +
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

  /**
   * Lead yopilganda xabar
   */
  async notifyAboutClosedLead(lead: any, closedBy: User, amount: number) {
    const leadTypeIcons = {
      'HOT': '🔥',
      'WARM': '🌤',
      'COLD': '❄️'
    };

    const message =
      `━━━━━━━━━━━━━━━━━━\n` +
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

  /**
   * Sug'urta muddati tugashiga xabar
   */
  async notifyAboutExpiringInsurance(car: any, daysLeft: number) {
    const emoji = daysLeft <= 3 ? '🔥' : daysLeft <= 7 ? '⚠️' : '📅';

    const message =
      `━━━━━━━━━━━━━━━━━━\n` +
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

  /**
   * Yangi admin qo'shilganda xabar
   */
  async notifyAboutNewAdmin(user: User, addedBy: string) {
    const message =
      `━━━━━━━━━━━━━━━━━━\n` +
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

  /**
   * Yangi operator qo'shilganda xabar
   */
  async notifyAboutNewOperator(user: User, addedBy: string) {
    const message =
      `━━━━━━━━━━━━━━━━━━\n` +
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

  /**
   * Yangi registrar qo'shilganda xabar
   */
  async notifyAboutNewRegistrar(user: User, addedBy: string) {
    const message =
      `━━━━━━━━━━━━━━━━━━\n` +
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
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from '../../database/entities/car.entity';
import { User } from '../../database/entities/user.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { BotService } from '../bot/bot.service';
import { Markup } from 'telegraf';

export interface ModerationData {
  plateNumber: string;
  ownerName: string;
  ownerPhone: string;
  secondPhone?: string | null;
  techPhoto: string;          // 🔥 Old tomoni
  techBackPhoto: string;      // 🔥 YANGI: Orqa tomoni (seriyali)
  carPhoto: string;
  insuranceType: '24days' | '6months' | '1year' | 'custom';  // 🔥 'custom' qo'shildi
  startDate: Date;
  endDate: Date;
  registrarId: number;
  registrarName: string;
  registrarTelegramId: string;
  submittedAt: Date;
}

export interface ModerationResult {
  id: string;
  data: ModerationData;
  status: 'pending' | 'approved' | 'rejected';
  notifiedOperators: number[];
  moderatedBy?: number;
  moderatedAt?: Date;
  rejectionReason?: {
    field?: string;
    message: string;
    details?: string;
  };
  expiresAt: number;
}

export interface RejectionReason {
  field?: string;
  message: string;
  details?: string;
}

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  // Vaqtinchalik xotira
  private moderationStorage = new Map<string, ModerationResult>();

  // 24 soat (ms hisobida)
  private readonly EXPIRY_TIME = 24 * 60 * 60 * 1000;

  // Maydon nomlarini o'zbek tiliga o'girish (🔥 YANGI: techBackPhoto qo'shildi)
  private readonly fieldNames: Record<string, string> = {
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

  constructor(
    @InjectRepository(Car) private carRepo: Repository<Car>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(CarInsurance) private insuranceRepo: Repository<CarInsurance>,
    private botService: BotService,
  ) {
    // Har soatda eskirgan moderatsiyalarni tozalash
    setInterval(() => this.cleanExpired(), 60 * 60 * 1000);

    // Har 10 daqiqada operatorlarga eslatma yuborish
    setInterval(() => this.remindOperators(), 10 * 60 * 1000);

    this.logger.log('🔄 ModerationService ishga tushdi');
  }

  /**
   * Yangi moderatsiya yaratish
   */
  async create(data: ModerationData): Promise<string> {
    const id = this.generateModerationId();

    const moderation: ModerationResult = {
      id,
      data,
      status: 'pending',
      notifiedOperators: [],
      expiresAt: Date.now() + this.EXPIRY_TIME
    };

    this.moderationStorage.set(id, moderation);

    this.logger.log(`✅ Moderatsiya yaratildi: ${id} - ${data.plateNumber} (${data.insuranceType})`);
    this.logger.log(`📊 Jami moderatsiyalar: ${this.moderationStorage.size} ta`);

    // Operatorlarga xabar yuborish
    await this.notifyOperators(id);

    // 24 soatdan keyin avtomatik rad etish
    setTimeout(async () => {
      await this.autoReject(id);
    }, this.EXPIRY_TIME);

    return id;
  }

  /**
   * Operatorlarga xabar yuborish (YANGI AVTOMOBIL MODERATSIYASI - 3 TA RASM LINK BILAN)
   */
  async notifyOperators(moderationId: string): Promise<void> {
    try {
      const moderation = this.moderationStorage.get(moderationId);
      if (!moderation || moderation.status !== 'pending') return;

      // Barcha operatorlarni olish
      const operators = await this.userRepo.find({
        where: { role: 'operator', isActive: true }
      });

      if (operators.length === 0) {
        this.logger.warn('⚠️ Faol operatorlar topilmadi');
        return;
      }

      const data = moderation.data;

      // BASE URL
      const baseUrl = process.env.APP_URL || 'http://localhost:3000';

      // To'liq URL'lar (3 TA RASM)
      const techPhotoFullUrl = data.techPhoto ? `${baseUrl}${data.techPhoto}` : null;
      const techBackPhotoFullUrl = data.techBackPhoto ? `${baseUrl}${data.techBackPhoto}` : null;
      const carPhotoFullUrl = data.carPhoto ? `${baseUrl}${data.carPhoto}` : null;

      // Sug'urta turini matnga o'girish (🔥 custom qo'shildi)
      const insuranceTypeText = this.getInsuranceTypeText(data.insuranceType);

      // Rasm linklari (3 TA RASM)
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

      const message =
        `━━━━━━━━━━━━━━━━━━\n` +
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

      // Operatorlarga xabar yuborish
      for (const operator of operators) {
        try {
          const keyboard = Markup.inlineKeyboard([
            [
              Markup.button.callback('✅ Tasdiqlash', `mod_approve_${moderationId}`),
              Markup.button.callback('❌ Rad etish', `mod_reject_${moderationId}`)
            ],
            [
              Markup.button.callback('📸 Rasmlarni koʻrish', `mod_photos_${moderationId}`),
              Markup.button.callback('📋 Batafsil', `mod_details_${moderationId}`)
            ]
          ]);

          await this.botService.sendMessage(operator.telegramId, message, keyboard);

          moderation.notifiedOperators.push(operator.id);
          this.logger.log(`📢 Operator #${operator.id} ga xabar yuborildi`);
        } catch (error) {
          this.logger.error(`❌ Operator #${operator.id} ga xabar yuborishda xatolik: ${error.message}`);
        }
      }

      this.moderationStorage.set(moderationId, moderation);

    } catch (error) {
      this.logger.error(`❌ Operatorlarga xabar yuborishda xatolik: ${error.message}`);
    }
  }

  /**
   * Operatorga xabar ketganini belgilash
   */
  async markNotified(moderationId: string, operatorId: number): Promise<void> {
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
    } catch (error) {
      this.logger.error(`❌ markNotified xatosi: ${error.message}`);
    }
  }

  /**
   * Tasdiqlanganlik haqida xabar yuborish (REGISTRATORGA OPERATOR NOMI YO'Q)
   * va registratorni asosiy menyuga qaytarish
   */
  async notifyApproval(moderationId: string, car: any): Promise<void> {
    try {
      const moderation = this.moderationStorage.get(moderationId);
      if (!moderation) return;

      const data = moderation.data;

      // REGISTRARGA XABAR YUBORISH (operator nomi YO'Q)
      const registrar = await this.userRepo.findOne({
        where: { id: data.registrarId }
      });

      // Sug'urta turini matnga o'girish
      const insuranceTypeText = this.getInsuranceTypeText(data.insuranceType);

      // BASE URL
      const baseUrl = process.env.APP_URL || 'http://localhost:3000';

      // To'liq URL'lar (3 TA RASM)
      const techPhotoFullUrl = data.techPhoto ? `${baseUrl}${data.techPhoto}` : null;
      const techBackPhotoFullUrl = data.techBackPhoto ? `${baseUrl}${data.techBackPhoto}` : null;
      const carPhotoFullUrl = data.carPhoto ? `${baseUrl}${data.carPhoto}` : null;

      // Rasm linklari
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

      // Registrar uchun xabar (operator nomi YO'Q)
      if (registrar?.telegramId) {
        const registrarMessage =
          `━━━━━━━━━━━━━━━━━━\n` +
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

        // 🔥 ASOSIY MENYUGA QAYTISH UCHUN KEYBOARD
        await this.botService.sendMessage(
          registrar.telegramId,
          '🏠 Asosiy menyu',
          {
            reply_markup: {
              keyboard: [
                ['🚗 Avtomobil qo\'shish'],
                ['🏠 Mening natijam'],
                ['📄 Qoidalar', '📞 Yordam']
              ],
              resize_keyboard: true
            }
          }
        );

        this.logger.log(`📨 Registrarga tasdiqlash xabari yuborildi va asosiy menyuga qaytarildi: ${registrar.telegramId}`);
      }

      // ADMINLARGA XABAR (operator nomi bilan - adminlar bilishi kerak)
      const admins = await this.userRepo.find({ where: { role: 'admin', isActive: true } });

      // Operatorni olish
      const operator = await this.userRepo.findOne({ where: { id: moderation.moderatedBy } });

      for (const admin of admins) {
        const adminMessage =
          `━━━━━━━━━━━━━━━━━━\n` +
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

    } catch (error) {
      this.logger.error(`❌ Tasdiqlash xabarini yuborishda xatolik: ${error.message}`);
    }
  }

  /**
   * Rad etilganlik haqida xabar yuborish (REGISTRATORGA OPERATOR NOMI YO'Q)
   * va registratorni asosiy menyuga qaytarish
   */
  async notifyRejection(moderationId: string, reason: RejectionReason): Promise<void> {
    try {
      const moderation = this.moderationStorage.get(moderationId);
      if (!moderation) return;

      const data = moderation.data;

      // REGISTRARGA XABAR YUBORISH (operator nomi YO'Q)
      const registrar = await this.userRepo.findOne({
        where: { id: data.registrarId }
      });

      const fieldName = reason.field ? this.fieldNames[reason.field] || reason.field : '';
      const fieldText = reason.field ? `\n📋 <b>Xato maydon:</b> ${fieldName}` : '';
      const detailsText = reason.details ? `\n📝 <b>Tafsilot:</b> ${reason.details}` : '';

      // Sug'urta turini matnga o'girish
      const insuranceTypeText = this.getInsuranceTypeText(data.insuranceType);

      // BASE URL
      const baseUrl = process.env.APP_URL || 'http://localhost:3000';

      // To'liq URL'lar (3 TA RASM)
      const techPhotoFullUrl = data.techPhoto ? `${baseUrl}${data.techPhoto}` : null;
      const techBackPhotoFullUrl = data.techBackPhoto ? `${baseUrl}${data.techBackPhoto}` : null;
      const carPhotoFullUrl = data.carPhoto ? `${baseUrl}${data.carPhoto}` : null;

      // Rasm linklari
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

      // Registrar uchun xabar (operator nomi YO'Q)
      if (registrar?.telegramId) {
        const registrarMessage =
          `━━━━━━━━━━━━━━━━━━\n` +
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

        // 🔥 ASOSIY MENYUGA QAYTISH UCHUN KEYBOARD
        await this.botService.sendMessage(
          registrar.telegramId,
          '🏠 Asosiy menyu',
          {
            reply_markup: {
              keyboard: [
                ['🚗 Avtomobil qo\'shish'],
                ['🏠 Mening natijam'],
                ['📄 Qoidalar', '📞 Yordam']
              ],
              resize_keyboard: true
            }
          }
        );

        this.logger.log(`📨 Registrarga rad etish xabari yuborildi va asosiy menyuga qaytarildi: ${registrar.telegramId} - Sabab: ${reason.message}`);
      }

      // ADMINLARGA XABAR (operator nomi bilan - adminlar bilishi kerak)
      const admins = await this.userRepo.find({ where: { role: 'admin', isActive: true } });

      // Operatorni olish
      const operator = await this.userRepo.findOne({ where: { id: moderation.moderatedBy } });

      for (const admin of admins) {
        const adminMessage =
          `━━━━━━━━━━━━━━━━━━\n` +
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

    } catch (error) {
      this.logger.error(`❌ Rad etish xabarini yuborishda xatolik: ${error.message}`);
    }
  }

  /**
   * Avtomatik rad etish (muddat o'tganda) - REGISTRARGA XABAR YUBORILADI
   * va registratorni asosiy menyuga qaytarish
   */
  private async autoReject(id: string): Promise<void> {
    const moderation = this.moderationStorage.get(id);
    if (!moderation || moderation.status !== 'pending') return;

    moderation.status = 'rejected';
    moderation.rejectionReason = {
      field: 'other',
      message: '⏰ Moderatsiya muddati tugadi (24 soat)'
    };
    this.moderationStorage.set(id, moderation);

    const data = moderation.data;

    // REGISTRARGA XABAR YUBORISH (operator nomi YO'Q)
    const registrar = await this.userRepo.findOne({
      where: { id: data.registrarId }
    });

    // Sug'urta turini matnga o'girish
    const insuranceTypeText = this.getInsuranceTypeText(data.insuranceType);

    // BASE URL
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    // To'liq URL'lar (3 TA RASM)
    const techPhotoFullUrl = data.techPhoto ? `${baseUrl}${data.techPhoto}` : null;
    const techBackPhotoFullUrl = data.techBackPhoto ? `${baseUrl}${data.techBackPhoto}` : null;
    const carPhotoFullUrl = data.carPhoto ? `${baseUrl}${data.carPhoto}` : null;

    // Rasm linklari
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
      const message =
        `━━━━━━━━━━━━━━━━━━\n` +
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

      // 🔥 ASOSIY MENYUGA QAYTISH UCHUN KEYBOARD
      await this.botService.sendMessage(
        registrar.telegramId,
        '🏠 Asosiy menyu',
        {
          reply_markup: {
            keyboard: [
              ['🚗 Avtomobil qo\'shish'],
              ['🏠 Mening natijam'],
              ['📄 Qoidalar', '📞 Yordam']
            ],
            resize_keyboard: true
          }
        }
      );

      this.logger.log(`📨 Registrarga muddat tugaganligi haqida xabar yuborildi va asosiy menyuga qaytarildi: ${registrar.telegramId}`);
    }

    // ADMINLARGA XABAR
    const admins = await this.userRepo.find({ where: { role: 'admin', isActive: true } });
    for (const admin of admins) {
      const adminMessage =
        `━━━━━━━━━━━━━━━━━━\n` +
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

  /**
   * Moderatsiya ma'lumotlarini olish
   */
  async get(id: string): Promise<ModerationResult | null> {
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

  /**
   * Moderatsiyani tasdiqlash
   */
  async approve(id: string, operatorId: number): Promise<{ success: boolean; car?: Car; message: string }> {
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

      // 🔥 Avtomobilni saqlash (techBackPhoto qo'shildi)
      const car = new Car();
      car.plateNumber = moderation.data.plateNumber;
      car.ownerName = moderation.data.ownerName;
      car.ownerPhone = moderation.data.ownerPhone;
      car.secondPhone = moderation.data.secondPhone;
      car.techPhoto = moderation.data.techPhoto;
      car.techBackPhoto = moderation.data.techBackPhoto;  // 🔥 YANGI
      car.carPhoto = moderation.data.carPhoto;
      car.moderationStatus = 'approved';
      car.moderatedById = operatorId;
      car.moderatedAt = new Date();
      car.submittedById = moderation.data.registrarId;
      car.createdById = moderation.data.registrarId;

      const savedCar = await this.carRepo.save(car);

      // Sug'urtani saqlash
      const insurance = new CarInsurance();
      insurance.carId = savedCar.id;
      insurance.startDate = moderation.data.startDate;
      insurance.endDate = moderation.data.endDate;
      insurance.type = moderation.data.insuranceType;
      insurance.createdById = operatorId;
      insurance.status = 'active';
      await this.insuranceRepo.save(insurance);

      // Moderatsiya statusini yangilash
      moderation.status = 'approved';
      moderation.moderatedBy = operatorId;
      moderation.moderatedAt = new Date();
      this.moderationStorage.set(id, moderation);

      // Xabar yuborish (registrarga va adminlarga) - registrarga operator nomi YO'Q
      await this.notifyApproval(id, savedCar);

      this.logger.log(`✅ Moderatsiya tasdiqlandi: ${id} - Operator: ${operator.firstName || operator.username}`);

      return {
        success: true,
        car: savedCar,
        message: '✅ Avtomobil muvaffaqiyatli tasdiqlandi'
      };

    } catch (error) {
      this.logger.error(`❌ Moderatsiyani tasdiqlashda xatolik: ${error.message}`);
      return { success: false, message: '❌ Xatolik yuz berdi' };
    }
  }

  /**
   * Moderatsiyani rad etish
   */
  async reject(
    id: string,
    operatorId: number,
    reason: RejectionReason
  ): Promise<{ success: boolean; message: string }> {
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

      // Moderatsiya statusini yangilash
      moderation.status = 'rejected';
      moderation.moderatedBy = operatorId;
      moderation.moderatedAt = new Date();
      moderation.rejectionReason = reason;
      this.moderationStorage.set(id, moderation);

      // Xabar yuborish (registrarga va adminlarga) - registrarga operator nomi YO'Q
      await this.notifyRejection(id, reason);

      this.logger.log(`❌ Moderatsiya rad etildi: ${id} - Operator: ${operator.firstName || operator.username} - Sabab: ${reason.message}`);

      return {
        success: true,
        message: '❌ Avtomobil rad etildi'
      };

    } catch (error) {
      this.logger.error(`❌ Moderatsiyani rad etishda xatolik: ${error.message}`);
      return { success: false, message: '❌ Xatolik yuz berdi' };
    }
  }

  /**
   * Kutilayotgan moderatsiyalar soni
   */
  async getPendingCount(): Promise<number> {
    let count = 0;
    const now = Date.now();

    for (const moderation of this.moderationStorage.values()) {
      if (moderation.status === 'pending' && moderation.expiresAt > now) {
        count++;
      }
    }

    return count;
  }

  /**
   * Kutilayotgan moderatsiyalar ro'yxati
   */
  async getPending(): Promise<ModerationResult[]> {
    const pending = [];
    const now = Date.now();

    for (const moderation of this.moderationStorage.values()) {
      if (moderation.status === 'pending' && moderation.expiresAt > now) {
        pending.push(moderation);
      }
    }

    return pending;
  }

  /**
   * Operatorga yuborilgan moderatsiyalar
   */
  async getOperatorModerations(operatorId: number): Promise<ModerationResult[]> {
    const result = [];
    const now = Date.now();

    for (const moderation of this.moderationStorage.values()) {
      if (moderation.notifiedOperators.includes(operatorId) && moderation.expiresAt > now) {
        result.push(moderation);
      }
    }

    return result;
  }

  /**
   * Operator statistikasi
   */
  async getOperatorStats(operatorId: number): Promise<any> {
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

        if (moderation.status === 'approved') totalApproved++;
        if (moderation.status === 'rejected') totalRejected++;

        if (moderatedAt >= today) {
          if (moderation.status === 'approved') todayApproved++;
          if (moderation.status === 'rejected') todayRejected++;
        }

        if (moderatedAt >= monthStart) {
          if (moderation.status === 'approved') monthApproved++;
          if (moderation.status === 'rejected') monthRejected++;
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

  /**
   * Operatorlarga eslatma yuborish
   */
  private async remindOperators(): Promise<void> {
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
            if (!moderation.notifiedOperators.includes(operator.id)) continue;

            const message =
              `⏰ <b>ESLATMA!</b>\n\n` +
              `🚗 Avtomobil: <b>${moderation.data.plateNumber}</b>\n` +
              `👤 Ega: ${moderation.data.ownerName}\n` +
              `📞 Tel: ${this.formatPhone(moderation.data.ownerPhone)}\n\n` +
              `⏳ Moderatsiya muddati tugashiga ${timeLeft} soat qoldi!\n\n` +
              `Iltimos, tezroq javob bering.`;

            const keyboard = Markup.inlineKeyboard([
              [
                Markup.button.callback('✅ Tasdiqlash', `mod_approve_${moderation.id}`),
                Markup.button.callback('❌ Rad etish', `mod_reject_${moderation.id}`)
              ]
            ]);

            await this.botService.sendMessage(operator.telegramId, message, keyboard);
          }

          this.logger.log(`⏰ Eslatma yuborildi: ${moderation.id} - ${timeLeft} soat qoldi`);
        }
      }

    } catch (error) {
      this.logger.error(`❌ Eslatma yuborishda xatolik: ${error.message}`);
    }
  }

  /**
   * Eski moderatsiyalarni tozalash
   */
  private async cleanExpired(): Promise<void> {
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

  /**
   * Unikal moderatsiya ID yaratish
   */
  private generateModerationId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `mod_${timestamp}_${random}`;
  }

  /**
   * Telefon raqamni formatlash
   */
  private formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
    }
    return phone;
  }

  /**
   * Sug'urta turini matnga o'girish (🔥 YANGILANGAN)
   */
  private getInsuranceTypeText(type: string): string {
    const types: Record<string, string> = {
      '24days': '24 kun',
      '6months': '6 oy',
      '1year': '1 yil',
      'custom': 'Maxsus sana'
    };
    return types[type] || type;
  }

  /**
   * KPI hisoblash (registrator uchun) - custom uchun 5000 so'm
   */
  private calculateKPI(insuranceType: string): number {
    const kpiValues: Record<string, number> = {
      '24days': 5000,
      '6months': 10000,
      '1year': 15000,
      'custom': 5000
    };
    return kpiValues[insuranceType] || 5000;
  }
}
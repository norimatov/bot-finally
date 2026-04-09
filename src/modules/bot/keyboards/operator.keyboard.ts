import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';

@Injectable()
export class OperatorKeyboard {
  
  // ============== ASOSIY OPERATOR PANELI ==============
  getOperatorMainKeyboard() {
    return Markup.keyboard([
      ['📋 Leadlar', '🔄 Moderatsiya'],
      ['📊 Mening statistikam', '📞 Qo\'ng\'iroqlar tarixi'],
      ['📅 Bugungi rejalar', '📄 Qoidalar'],
      ['📞 Yordam', '⬅️ Orqaga']
    ]).resize().persistent();
  }

  // ============== MODERATSIYA PANELI ==============
  getModerationKeyboard() {
    return Markup.keyboard([
      ['⏳ Kutilayotganlar', '📋 Menga yuborilganlar'],
      ['📊 Moderatsiya statistikasi'],
      ['⬅️ Orqaga']
    ]).resize().persistent();
  }

  // ============== LEADLAR ICHKI MENYUSI ==============
  getLeadsMenuKeyboard() {
    return Markup.keyboard([
      ['🔥 HOT leadlar', '🌤 WARM leadlar'],
      ['❄️ COLD leadlar', '✅ Yopilganlar'],
      ['📞 Qo\'ng\'iroqlar tarixi', '📅 Bugungi rejalar'],
      ['⬅️ Orqaga']
    ]).resize().persistent();
  }

  // ============== LEAD STATUS TUGMALARI ==============
  getLeadStatusKeyboard(leadId: number) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Yopildi', `close_${leadId}`),
        Markup.button.callback('⏳ Keyinroq', `later_${leadId}`)
      ],
      [
        Markup.button.callback('✖ Rad etildi', `reject_${leadId}`),
        Markup.button.callback('📞 Qo\'ng\'iroq', `call_${leadId}`)
      ],
      [
        Markup.button.callback('📝 Eslatma', `note_${leadId}`),
        Markup.button.callback('📊 Ma\'lumot', `info_${leadId}`)
      ]
    ]);
  }

  /**
   * Qo'ng'iroq natijalari uchun keyboard
   */
  getCallResultKeyboard(leadId: number) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Mijoz rozi', `close_${leadId}`),
        Markup.button.callback('⏳ Keyinroq qo\'ng\'iroq', `later_${leadId}`)
      ],
      [
        Markup.button.callback('✖ Rad etdi', `reject_${leadId}`),
        Markup.button.callback('📞 Qayta qo\'ng\'iroq', `recall_${leadId}`)
      ],
      [
        Markup.button.callback('📝 Eslatma yozish', `note_${leadId}`),
        Markup.button.callback('⬅️ Orqaga', `back_${leadId}`)
      ]
    ]);
  }

  /**
   * Eslatma vaqtlari uchun keyboard
   */
  getReminderTimeKeyboard(leadId: number) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('⏰ 1 soatdan keyin', `remind_1h_${leadId}`),
        Markup.button.callback('⏰ 3 soatdan keyin', `remind_3h_${leadId}`)
      ],
      [
        Markup.button.callback('⏰ Ertaga 9:00', `remind_tomorrow_${leadId}`),
        Markup.button.callback('📅 3 kundan keyin', `remind_3d_${leadId}`)
      ],
      [
        Markup.button.callback('📅 Haftadan keyin', `remind_week_${leadId}`),
        Markup.button.callback('⬅️ Orqaga', `back_${leadId}`)
      ]
    ]);
  }

  /**
   * Mijoz ma'lumotlari uchun keyboard
   */
  getCustomerInfoKeyboard(leadId: number) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📞 Telefon qilish', `call_${leadId}`),
        Markup.button.callback('📨 SMS yozish', `sms_${leadId}`)
      ],
      [
        Markup.button.callback('📝 Eslatma', `note_${leadId}`),
        Markup.button.callback('📊 Lead tarixi', `history_${leadId}`)
      ],
      [
        Markup.button.callback('⬅️ Orqaga', `back_${leadId}`)
      ]
    ]);
  }

  /**
   * Kunlik rejalar uchun keyboard
   */
  getDailyPlanKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📞 Bugungi qo\'ng\'iroqlar', 'today_calls'),
        Markup.button.callback('✅ Bajarilganlar', 'completed_today')
      ],
      [
        Markup.button.callback('⏳ Kutilayotganlar', 'pending_today'),
        Markup.button.callback('📊 Kunlik statistika', 'daily_stats')
      ],
      [
        Markup.button.callback('📋 Ertangi rejalar', 'tomorrow_plan'),
        Markup.button.callback('📈 Haftalik', 'weekly_stats')
      ]
    ]);
  }

  // ============== LEAD FILTER TUGMALARI ==============
  getLeadFilterKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('🔥 HOT', 'filter_hot'),
        Markup.button.callback('🌤 WARM', 'filter_warm'),
        Markup.button.callback('❄️ COLD', 'filter_cold')
      ],
      [
        Markup.button.callback('✅ Yopilgan', 'filter_closed'),
        Markup.button.callback('✖ Rad etilgan', 'filter_rejected')
      ],
      [
        Markup.button.callback('📋 Hammasi', 'filter_all')
      ]
    ]);
  }

  // ============== LEAD PAGINATION ==============
  getPaginationKeyboard(currentPage: number, totalPages: number) {
    const buttons = [];
    
    if (currentPage > 1) {
      buttons.push(Markup.button.callback('⬅️', `page_${currentPage - 1}`));
    }
    
    buttons.push(Markup.button.callback(`${currentPage}/${totalPages}`, 'current'));
    
    if (currentPage < totalPages) {
      buttons.push(Markup.button.callback('➡️', `page_${currentPage + 1}`));
    }
    
    return Markup.inlineKeyboard([buttons]);
  }

  // ============== MIJOZ BILAN BOG'LANISH ==============
  getContactKeyboard(phone: string, carPlate: string) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📞 Telefon qilish', `call_${phone}`),
        Markup.button.url('💬 Xabar yozish', `https://t.me/+${phone}`)
      ],
      [
        Markup.button.callback('✅ Lead yopildi', `close_lead`),
        Markup.button.callback('⏳ Eslatma', `remind_${carPlate}`)
      ]
    ]);
  }

  // ============== QO'SHIMCHA AMALLAR ==============
  getAdditionalActionsKeyboard(leadId: number) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📝 Eslatma qo\'shish', `note_${leadId}`),
        Markup.button.callback('📞 Qayta qo\'ng\'iroq', `recall_${leadId}`)
      ],
      [
        Markup.button.callback('📊 Lead tarixi', `history_${leadId}`),
        Markup.button.callback('📨 SMS yozish', `sms_${leadId}`)
      ]
    ]);
  }

  // ============== STATISTIKA BO'LIMI ==============
  getStatsKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📅 Kunlik', 'stats_daily'),
        Markup.button.callback('📆 Haftalik', 'stats_weekly')
      ],
      [
        Markup.button.callback('📊 Oylik', 'stats_monthly'),
        Markup.button.callback('📈 Yillik', 'stats_yearly')
      ]
    ]);
  }
}
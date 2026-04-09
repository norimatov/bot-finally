import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';

@Injectable()
export class AdminKeyboard {
  
  // ============== ASOSIY ADMIN PANEL ==============
  getAdminMainKeyboard() {
    return Markup.keyboard([
      ['📊 Statistika', '👥 Foydalanuvchilar'],
      ['🚗 Avtomobillar', '📋 Leadlar'],
      ['💰 Moliya', '📊 Hisobotlar'],
      ['⚙️ Sozlamalar', '⬅️ Orqaga']
    ]).resize();
  }

  // ============== STATISTIKA BO'LIMI ==============
  getStatsKeyboard() {
    return Markup.keyboard([
      ['📊 Bugun', '📆 Shu oy'],
      ['📈 Yillik', '🏆 Reyting'],
      ['📉 Lead statistikasi', '📊 KPI statistikasi'],
      ['⬅️ Orqaga']
    ]).resize();
  }

  // ============== FOYDALANUVCHILAR BO'LIMI (YANGILANGAN) ==============
  getUserManagementKeyboard() {
    return Markup.keyboard([
      ['👥 Barcha userlar', '👑 Adminlar'],           // Yangi: Adminlar
      ['🎮 Operatorlar', '📋 Registratorlar'],        // Yangi: Operatorlar va Registratorlar
      ['➕ Operator qo\'shish', '✖️ Operator o\'chirish'],
      ['👑 Admin qo\'shish', '📋 Rol o\'zgartirish'],
      ['⬅️ Orqaga']
    ]).resize();
  }

  // ============== LEADLAR BO'LIMI ==============
  getLeadManagementKeyboard() {
    return Markup.keyboard([
      ['🔥 HOT leadlar', '🌤 WARM leadlar'],
      ['❄️ COLD leadlar', '✅ Yopilgan leadlar'],
      ['📊 Lead hisobot', '📤 Lead taqsimlash'],
      ['⬅️ Orqaga']
    ]).resize();
  }

  // ============== MOLIYA BO'LIMI ==============
  getFinanceKeyboard() {
    return Markup.keyboard([
      ['💰 To\'lovlar', '💳 KPI hisoblash'],
      ['📊 Oylik moliya', '📈 Daromad'],
      ['📥 Excel export', '⬅️ Orqaga']
    ]).resize();
  }

  // ============== HISOBOTLAR BO'LIMI (YANGILANGAN) ==============
  getReportsKeyboard() {
    return Markup.keyboard([
      ['📊 Operator hisoboti', '📋 Lead hisoboti'],
      ['🚗 Avtomobil hisoboti', '💰 Moliya hisoboti'],
      ['📥 Excel export', '📊 Sug\'urta hisoboti'],    // Yangi: Sug'urta hisoboti
      ['⬅️ Orqaga']
    ]).resize();
  }

  // ============== SOZLAMALAR BO'LIMI ==============
  getSettingsKeyboard() {
    return Markup.keyboard([
      ['⚙️ KPI sozlamalari', '🔔 Bildirishnomalar'],
      ['🕒 Ish vaqti', '📝 Qoidalar'],
      ['💾 Backup', '⬅️ Orqaga']
    ]).resize();
  }

  // ============== AVTOMOBILLAR BO'LIMI (YANGILANGAN) ==============
  getCarsKeyboard() {
    return Markup.keyboard([
      ['🚗 Barcha avtomobillar', '➕ Avtomobil qo\'shish'],
      ['🔍 Avtomobil qidirish', '📋 Sug\'urta muddati tugaydiganlar'],
      ['❌ Muddati o\'tganlar', '📊 Avtomobil statistikasi'],
      ['🚙 Sug\'urtalar', '⬅️ Orqaga']
    ]).resize();
  }

  // ============== SUG'URTA BO'LIMI (YANGILANGAN) ==============
  getInsuranceKeyboard() {
    return Markup.keyboard([
      ['📋 Aktiv sug\'urtalar', '⚠️ 30 kunda tugaydiganlar'],
      ['❌ Muddati o\'tganlar', '📊 Sug\'urta statistikasi'],
      ['📥 Excel export', '⬅️ Orqaga']
    ]).resize();
  }

  //! ============== YANGI: SUG'URTA TURLARI BO'YICHA ==============
  getInsuranceTypeKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('📆 24 kunlik', 'insurance_24days')],
      [Markup.button.callback('📆 6 oylik', 'insurance_6months')],
      [Markup.button.callback('📆 1 yillik', 'insurance_1year')],
      [Markup.button.callback('📊 Barcha turlar', 'insurance_all')]
    ]);
  }

  //! ============== YANGI: RASM TURLARI UCHUN ==============
  getPhotoTypeKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('📸 Tex pasport', 'photo_tech')],
      [Markup.button.callback('📸 Mashina rasmi', 'photo_car')],
      [Markup.button.callback('📸 Ikkala rasm', 'photo_both')],
      [Markup.button.callback('⬅️ Orqaga', 'photo_back')]
    ]);
  }

  // ============== INLINE KEYBOARDS ==============
  
  // Sana tanlash uchun
  getDateKeyboard(days: number = 7) {
    const buttons = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const formattedDate = date.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      buttons.push([
        Markup.button.callback(
          `📅 ${formattedDate}`,
          `stats_${date.toISOString().split('T')[0]}`
        )
      ]);
    }
    
    return Markup.inlineKeyboard(buttons);
  }

  // Rol o'zgartirish uchun
  getUserRoleKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📋 Registrar', 'role_registrar'),
        Markup.button.callback('🎮 Operator', 'role_operator')
      ],
      [
        Markup.button.callback('👑 Admin', 'role_admin'),
        Markup.button.callback('❌ Bekor qilish', 'role_cancel')
      ]
    ]);
  }

  // Export formatlari uchun
  getExportKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📅 Kunlik', 'export_daily'),
        Markup.button.callback('📆 Oylik', 'export_monthly')
      ],
      [
        Markup.button.callback('📊 To\'liq', 'export_all'),
        Markup.button.callback('📥 Excel', 'export_excel')
      ],
      [
        Markup.button.callback('🚗 Avtomobillar', 'export_cars'),
        Markup.button.callback('📋 Leadlar', 'export_leads')
      ]
    ]);
  }

  // To'lov tasdiqlash uchun
  getPaymentConfirmKeyboard(paymentId: number) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Tasdiqlash', `pay_confirm_${paymentId}`),
        Markup.button.callback('❌ Bekor qilish', `pay_cancel_${paymentId}`)
      ]
    ]);
  }

  // Operator amallari uchun
  getOperatorActionKeyboard(operatorId: number) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📊 Statistika', `op_stats_${operatorId}`),
        Markup.button.callback('💰 To\'lov', `op_pay_${operatorId}`)
      ],
      [
        Markup.button.callback('✖️ O\'chirish', `op_delete_${operatorId}`),
        Markup.button.callback('📋 Leadlari', `op_leads_${operatorId}`)
      ]
    ]);
  }

  // Lead taqsimlash uchun
  getLeadAssignKeyboard(leadId: number, operators: any[]) {
    const buttons = [];
    for (const op of operators.slice(0, 3)) {
      buttons.push(
        Markup.button.callback(`👤 ${op.name}`, `assign_${leadId}_${op.id}`)
      );
    }
    return Markup.inlineKeyboard([
      buttons,
      [Markup.button.callback('⬅️ Orqaga', `cancel_${leadId}`)]
    ]);
  }

  //! ============== YANGI: AVTOMOBIL QIDIRISH UCHUN ==============
  getCarSearchKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('🔍 Raqam bo\'yicha', 'search_plate'),
        Markup.button.callback('🔍 Telefon bo\'yicha', 'search_phone')
      ],
      [
        Markup.button.callback('🔍 Ega ismi bo\'yicha', 'search_owner'),
        Markup.button.callback('📋 Barcha avtomobillar', 'search_all')
      ]
    ]);
  }

  //! ============== YANGI: AVTOMOBIL AMALLARI UCHUN ==============
  getCarActionKeyboard(carId: number) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📝 Tahrirlash', `car_edit_${carId}`),
        Markup.button.callback('📸 Rasmlar', `car_photos_${carId}`)
      ],
      [
        Markup.button.callback('📅 Sug\'urta', `car_insurance_${carId}`),
        Markup.button.callback('📋 Lead yaratish', `car_create_lead_${carId}`)
      ],
      [
        Markup.button.callback('❌ O\'chirish', `car_delete_${carId}`),
        Markup.button.callback('⬅️ Orqaga', 'car_back')
      ]
    ]);
  }

  //! ============== YANGI: SUG'URTA MUDDATI TANLASH UCHUN ==============
  getInsuranceDurationKeyboard() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('📆 24 kun', 'duration_24days')],
      [Markup.button.callback('📆 6 oy', 'duration_6months')],
      [Markup.button.callback('📆 1 yil', 'duration_1year')],
      [Markup.button.callback('⬅️ Orqaga', 'duration_back')]
    ]);
  }
}
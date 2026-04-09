import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';

@Injectable()
export class MainKeyboard {
  
  getMainKeyboard(role: string) {
    if (role === 'admin') {
      return Markup.keyboard([
        ['👑 Admin panel'],
        ['🚗 Avtomobil qo\'shish', '🏠 Mening natijam'],
        ['🔥 Hot leadlar', '📄 Qoidalar'],
        ['⬅️ Orqaga']
      ]).resize();
    }
    
    if (role === 'operator') {
      return Markup.keyboard([
        ['📋 Leadlar', '📊 Mening statistikam'],
        ['📄 Qoidalar', '📞 Yordam'],
        ['⬅️ Orqaga']
      ]).resize();
    }
    
    // Registrar uchun
    return Markup.keyboard([
      ['🚗 Avtomobil qo\'shish'],
      ['🏠 Mening natijam', '📄 Qoidalar'],
      ['📞 Yordam']
    ]).resize();
  }

  getAdminKeyboard() {
    return Markup.keyboard([
      ['📊 Bugun', '📆 Shu oy'],
      ['👥 Xodimlar', '🏆 Reyting'],
      ['💰 To\'lovlar', '📥 Excel export'],
      ['⬅️ Orqaga']
    ]).resize();
  }

  getOperatorKeyboard() {
    return Markup.keyboard([
      ['📋 Leadlar', '📊 Mening statistikam'],
      ['📄 Qoidalar', '📞 Yordam'],
      ['⬅️ Orqaga']
    ]).resize();
  }

  getRegistrarKeyboard() {
    return Markup.keyboard([
      ['🚗 Avtomobil qo\'shish'],
      ['🏠 Mening natijam', '📄 Qoidalar'],
      ['📞 Yordam']
    ]).resize();
  }

  getBackKeyboard() {
    return Markup.keyboard([['⬅️ Orqaga']]).resize();
  }

  getCancelKeyboard() {
    return Markup.keyboard([['❌ Bekor qilish']]).resize();
  }

  getPhoneKeyboard() {
    return Markup.keyboard([
      [Markup.button.contactRequest('📱 Telefon raqamni yuborish')],
      ['❌ Bekor qilish']
    ]).resize();
  }
}
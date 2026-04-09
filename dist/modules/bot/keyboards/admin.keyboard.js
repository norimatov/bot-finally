"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminKeyboard = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
let AdminKeyboard = class AdminKeyboard {
    getAdminMainKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['📊 Statistika', '👥 Foydalanuvchilar'],
            ['🚗 Avtomobillar', '📋 Leadlar'],
            ['💰 Moliya', '📊 Hisobotlar'],
            ['⚙️ Sozlamalar', '⬅️ Orqaga']
        ]).resize();
    }
    getStatsKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['📊 Bugun', '📆 Shu oy'],
            ['📈 Yillik', '🏆 Reyting'],
            ['📉 Lead statistikasi', '📊 KPI statistikasi'],
            ['⬅️ Orqaga']
        ]).resize();
    }
    getUserManagementKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['👥 Barcha userlar', '👑 Adminlar'],
            ['🎮 Operatorlar', '📋 Registratorlar'],
            ['➕ Operator qo\'shish', '✖️ Operator o\'chirish'],
            ['👑 Admin qo\'shish', '📋 Rol o\'zgartirish'],
            ['⬅️ Orqaga']
        ]).resize();
    }
    getLeadManagementKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['🔥 HOT leadlar', '🌤 WARM leadlar'],
            ['❄️ COLD leadlar', '✅ Yopilgan leadlar'],
            ['📊 Lead hisobot', '📤 Lead taqsimlash'],
            ['⬅️ Orqaga']
        ]).resize();
    }
    getFinanceKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['💰 To\'lovlar', '💳 KPI hisoblash'],
            ['📊 Oylik moliya', '📈 Daromad'],
            ['📥 Excel export', '⬅️ Orqaga']
        ]).resize();
    }
    getReportsKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['📊 Operator hisoboti', '📋 Lead hisoboti'],
            ['🚗 Avtomobil hisoboti', '💰 Moliya hisoboti'],
            ['📥 Excel export', '📊 Sug\'urta hisoboti'],
            ['⬅️ Orqaga']
        ]).resize();
    }
    getSettingsKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['⚙️ KPI sozlamalari', '🔔 Bildirishnomalar'],
            ['🕒 Ish vaqti', '📝 Qoidalar'],
            ['💾 Backup', '⬅️ Orqaga']
        ]).resize();
    }
    getCarsKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['🚗 Barcha avtomobillar', '➕ Avtomobil qo\'shish'],
            ['🔍 Avtomobil qidirish', '📋 Sug\'urta muddati tugaydiganlar'],
            ['❌ Muddati o\'tganlar', '📊 Avtomobil statistikasi'],
            ['🚙 Sug\'urtalar', '⬅️ Orqaga']
        ]).resize();
    }
    getInsuranceKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['📋 Aktiv sug\'urtalar', '⚠️ 30 kunda tugaydiganlar'],
            ['❌ Muddati o\'tganlar', '📊 Sug\'urta statistikasi'],
            ['📥 Excel export', '⬅️ Orqaga']
        ]).resize();
    }
    getInsuranceTypeKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('📆 24 kunlik', 'insurance_24days')],
            [telegraf_1.Markup.button.callback('📆 6 oylik', 'insurance_6months')],
            [telegraf_1.Markup.button.callback('📆 1 yillik', 'insurance_1year')],
            [telegraf_1.Markup.button.callback('📊 Barcha turlar', 'insurance_all')]
        ]);
    }
    getPhotoTypeKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('📸 Tex pasport', 'photo_tech')],
            [telegraf_1.Markup.button.callback('📸 Mashina rasmi', 'photo_car')],
            [telegraf_1.Markup.button.callback('📸 Ikkala rasm', 'photo_both')],
            [telegraf_1.Markup.button.callback('⬅️ Orqaga', 'photo_back')]
        ]);
    }
    getDateKeyboard(days = 7) {
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
                telegraf_1.Markup.button.callback(`📅 ${formattedDate}`, `stats_${date.toISOString().split('T')[0]}`)
            ]);
        }
        return telegraf_1.Markup.inlineKeyboard(buttons);
    }
    getUserRoleKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('📋 Registrar', 'role_registrar'),
                telegraf_1.Markup.button.callback('🎮 Operator', 'role_operator')
            ],
            [
                telegraf_1.Markup.button.callback('👑 Admin', 'role_admin'),
                telegraf_1.Markup.button.callback('❌ Bekor qilish', 'role_cancel')
            ]
        ]);
    }
    getExportKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('📅 Kunlik', 'export_daily'),
                telegraf_1.Markup.button.callback('📆 Oylik', 'export_monthly')
            ],
            [
                telegraf_1.Markup.button.callback('📊 To\'liq', 'export_all'),
                telegraf_1.Markup.button.callback('📥 Excel', 'export_excel')
            ],
            [
                telegraf_1.Markup.button.callback('🚗 Avtomobillar', 'export_cars'),
                telegraf_1.Markup.button.callback('📋 Leadlar', 'export_leads')
            ]
        ]);
    }
    getPaymentConfirmKeyboard(paymentId) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('✅ Tasdiqlash', `pay_confirm_${paymentId}`),
                telegraf_1.Markup.button.callback('❌ Bekor qilish', `pay_cancel_${paymentId}`)
            ]
        ]);
    }
    getOperatorActionKeyboard(operatorId) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('📊 Statistika', `op_stats_${operatorId}`),
                telegraf_1.Markup.button.callback('💰 To\'lov', `op_pay_${operatorId}`)
            ],
            [
                telegraf_1.Markup.button.callback('✖️ O\'chirish', `op_delete_${operatorId}`),
                telegraf_1.Markup.button.callback('📋 Leadlari', `op_leads_${operatorId}`)
            ]
        ]);
    }
    getLeadAssignKeyboard(leadId, operators) {
        const buttons = [];
        for (const op of operators.slice(0, 3)) {
            buttons.push(telegraf_1.Markup.button.callback(`👤 ${op.name}`, `assign_${leadId}_${op.id}`));
        }
        return telegraf_1.Markup.inlineKeyboard([
            buttons,
            [telegraf_1.Markup.button.callback('⬅️ Orqaga', `cancel_${leadId}`)]
        ]);
    }
    getCarSearchKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('🔍 Raqam bo\'yicha', 'search_plate'),
                telegraf_1.Markup.button.callback('🔍 Telefon bo\'yicha', 'search_phone')
            ],
            [
                telegraf_1.Markup.button.callback('🔍 Ega ismi bo\'yicha', 'search_owner'),
                telegraf_1.Markup.button.callback('📋 Barcha avtomobillar', 'search_all')
            ]
        ]);
    }
    getCarActionKeyboard(carId) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('📝 Tahrirlash', `car_edit_${carId}`),
                telegraf_1.Markup.button.callback('📸 Rasmlar', `car_photos_${carId}`)
            ],
            [
                telegraf_1.Markup.button.callback('📅 Sug\'urta', `car_insurance_${carId}`),
                telegraf_1.Markup.button.callback('📋 Lead yaratish', `car_create_lead_${carId}`)
            ],
            [
                telegraf_1.Markup.button.callback('❌ O\'chirish', `car_delete_${carId}`),
                telegraf_1.Markup.button.callback('⬅️ Orqaga', 'car_back')
            ]
        ]);
    }
    getInsuranceDurationKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback('📆 24 kun', 'duration_24days')],
            [telegraf_1.Markup.button.callback('📆 6 oy', 'duration_6months')],
            [telegraf_1.Markup.button.callback('📆 1 yil', 'duration_1year')],
            [telegraf_1.Markup.button.callback('⬅️ Orqaga', 'duration_back')]
        ]);
    }
};
exports.AdminKeyboard = AdminKeyboard;
exports.AdminKeyboard = AdminKeyboard = __decorate([
    (0, common_1.Injectable)()
], AdminKeyboard);
//# sourceMappingURL=admin.keyboard.js.map
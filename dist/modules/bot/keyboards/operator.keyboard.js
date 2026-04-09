"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorKeyboard = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
let OperatorKeyboard = class OperatorKeyboard {
    getOperatorMainKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['📋 Leadlar', '🔄 Moderatsiya'],
            ['📊 Mening statistikam', '📞 Qo\'ng\'iroqlar tarixi'],
            ['📅 Bugungi rejalar', '📄 Qoidalar'],
            ['📞 Yordam', '⬅️ Orqaga']
        ]).resize().persistent();
    }
    getModerationKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['⏳ Kutilayotganlar', '📋 Menga yuborilganlar'],
            ['📊 Moderatsiya statistikasi'],
            ['⬅️ Orqaga']
        ]).resize().persistent();
    }
    getLeadsMenuKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['🔥 HOT leadlar', '🌤 WARM leadlar'],
            ['❄️ COLD leadlar', '✅ Yopilganlar'],
            ['📞 Qo\'ng\'iroqlar tarixi', '📅 Bugungi rejalar'],
            ['⬅️ Orqaga']
        ]).resize().persistent();
    }
    getLeadStatusKeyboard(leadId) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('✅ Yopildi', `close_${leadId}`),
                telegraf_1.Markup.button.callback('⏳ Keyinroq', `later_${leadId}`)
            ],
            [
                telegraf_1.Markup.button.callback('✖ Rad etildi', `reject_${leadId}`),
                telegraf_1.Markup.button.callback('📞 Qo\'ng\'iroq', `call_${leadId}`)
            ],
            [
                telegraf_1.Markup.button.callback('📝 Eslatma', `note_${leadId}`),
                telegraf_1.Markup.button.callback('📊 Ma\'lumot', `info_${leadId}`)
            ]
        ]);
    }
    getCallResultKeyboard(leadId) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('✅ Mijoz rozi', `close_${leadId}`),
                telegraf_1.Markup.button.callback('⏳ Keyinroq qo\'ng\'iroq', `later_${leadId}`)
            ],
            [
                telegraf_1.Markup.button.callback('✖ Rad etdi', `reject_${leadId}`),
                telegraf_1.Markup.button.callback('📞 Qayta qo\'ng\'iroq', `recall_${leadId}`)
            ],
            [
                telegraf_1.Markup.button.callback('📝 Eslatma yozish', `note_${leadId}`),
                telegraf_1.Markup.button.callback('⬅️ Orqaga', `back_${leadId}`)
            ]
        ]);
    }
    getReminderTimeKeyboard(leadId) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('⏰ 1 soatdan keyin', `remind_1h_${leadId}`),
                telegraf_1.Markup.button.callback('⏰ 3 soatdan keyin', `remind_3h_${leadId}`)
            ],
            [
                telegraf_1.Markup.button.callback('⏰ Ertaga 9:00', `remind_tomorrow_${leadId}`),
                telegraf_1.Markup.button.callback('📅 3 kundan keyin', `remind_3d_${leadId}`)
            ],
            [
                telegraf_1.Markup.button.callback('📅 Haftadan keyin', `remind_week_${leadId}`),
                telegraf_1.Markup.button.callback('⬅️ Orqaga', `back_${leadId}`)
            ]
        ]);
    }
    getCustomerInfoKeyboard(leadId) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('📞 Telefon qilish', `call_${leadId}`),
                telegraf_1.Markup.button.callback('📨 SMS yozish', `sms_${leadId}`)
            ],
            [
                telegraf_1.Markup.button.callback('📝 Eslatma', `note_${leadId}`),
                telegraf_1.Markup.button.callback('📊 Lead tarixi', `history_${leadId}`)
            ],
            [
                telegraf_1.Markup.button.callback('⬅️ Orqaga', `back_${leadId}`)
            ]
        ]);
    }
    getDailyPlanKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('📞 Bugungi qo\'ng\'iroqlar', 'today_calls'),
                telegraf_1.Markup.button.callback('✅ Bajarilganlar', 'completed_today')
            ],
            [
                telegraf_1.Markup.button.callback('⏳ Kutilayotganlar', 'pending_today'),
                telegraf_1.Markup.button.callback('📊 Kunlik statistika', 'daily_stats')
            ],
            [
                telegraf_1.Markup.button.callback('📋 Ertangi rejalar', 'tomorrow_plan'),
                telegraf_1.Markup.button.callback('📈 Haftalik', 'weekly_stats')
            ]
        ]);
    }
    getLeadFilterKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('🔥 HOT', 'filter_hot'),
                telegraf_1.Markup.button.callback('🌤 WARM', 'filter_warm'),
                telegraf_1.Markup.button.callback('❄️ COLD', 'filter_cold')
            ],
            [
                telegraf_1.Markup.button.callback('✅ Yopilgan', 'filter_closed'),
                telegraf_1.Markup.button.callback('✖ Rad etilgan', 'filter_rejected')
            ],
            [
                telegraf_1.Markup.button.callback('📋 Hammasi', 'filter_all')
            ]
        ]);
    }
    getPaginationKeyboard(currentPage, totalPages) {
        const buttons = [];
        if (currentPage > 1) {
            buttons.push(telegraf_1.Markup.button.callback('⬅️', `page_${currentPage - 1}`));
        }
        buttons.push(telegraf_1.Markup.button.callback(`${currentPage}/${totalPages}`, 'current'));
        if (currentPage < totalPages) {
            buttons.push(telegraf_1.Markup.button.callback('➡️', `page_${currentPage + 1}`));
        }
        return telegraf_1.Markup.inlineKeyboard([buttons]);
    }
    getContactKeyboard(phone, carPlate) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('📞 Telefon qilish', `call_${phone}`),
                telegraf_1.Markup.button.url('💬 Xabar yozish', `https://t.me/+${phone}`)
            ],
            [
                telegraf_1.Markup.button.callback('✅ Lead yopildi', `close_lead`),
                telegraf_1.Markup.button.callback('⏳ Eslatma', `remind_${carPlate}`)
            ]
        ]);
    }
    getAdditionalActionsKeyboard(leadId) {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('📝 Eslatma qo\'shish', `note_${leadId}`),
                telegraf_1.Markup.button.callback('📞 Qayta qo\'ng\'iroq', `recall_${leadId}`)
            ],
            [
                telegraf_1.Markup.button.callback('📊 Lead tarixi', `history_${leadId}`),
                telegraf_1.Markup.button.callback('📨 SMS yozish', `sms_${leadId}`)
            ]
        ]);
    }
    getStatsKeyboard() {
        return telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('📅 Kunlik', 'stats_daily'),
                telegraf_1.Markup.button.callback('📆 Haftalik', 'stats_weekly')
            ],
            [
                telegraf_1.Markup.button.callback('📊 Oylik', 'stats_monthly'),
                telegraf_1.Markup.button.callback('📈 Yillik', 'stats_yearly')
            ]
        ]);
    }
};
exports.OperatorKeyboard = OperatorKeyboard;
exports.OperatorKeyboard = OperatorKeyboard = __decorate([
    (0, common_1.Injectable)()
], OperatorKeyboard);
//# sourceMappingURL=operator.keyboard.js.map
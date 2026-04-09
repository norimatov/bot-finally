"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainKeyboard = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
let MainKeyboard = class MainKeyboard {
    getMainKeyboard(role) {
        if (role === 'admin') {
            return telegraf_1.Markup.keyboard([
                ['👑 Admin panel'],
                ['🚗 Avtomobil qo\'shish', '🏠 Mening natijam'],
                ['🔥 Hot leadlar', '📄 Qoidalar'],
                ['⬅️ Orqaga']
            ]).resize();
        }
        if (role === 'operator') {
            return telegraf_1.Markup.keyboard([
                ['📋 Leadlar', '📊 Mening statistikam'],
                ['📄 Qoidalar', '📞 Yordam'],
                ['⬅️ Orqaga']
            ]).resize();
        }
        return telegraf_1.Markup.keyboard([
            ['🚗 Avtomobil qo\'shish'],
            ['🏠 Mening natijam', '📄 Qoidalar'],
            ['📞 Yordam']
        ]).resize();
    }
    getAdminKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['📊 Bugun', '📆 Shu oy'],
            ['👥 Xodimlar', '🏆 Reyting'],
            ['💰 To\'lovlar', '📥 Excel export'],
            ['⬅️ Orqaga']
        ]).resize();
    }
    getOperatorKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['📋 Leadlar', '📊 Mening statistikam'],
            ['📄 Qoidalar', '📞 Yordam'],
            ['⬅️ Orqaga']
        ]).resize();
    }
    getRegistrarKeyboard() {
        return telegraf_1.Markup.keyboard([
            ['🚗 Avtomobil qo\'shish'],
            ['🏠 Mening natijam', '📄 Qoidalar'],
            ['📞 Yordam']
        ]).resize();
    }
    getBackKeyboard() {
        return telegraf_1.Markup.keyboard([['⬅️ Orqaga']]).resize();
    }
    getCancelKeyboard() {
        return telegraf_1.Markup.keyboard([['❌ Bekor qilish']]).resize();
    }
    getPhoneKeyboard() {
        return telegraf_1.Markup.keyboard([
            [telegraf_1.Markup.button.contactRequest('📱 Telefon raqamni yuborish')],
            ['❌ Bekor qilish']
        ]).resize();
    }
};
exports.MainKeyboard = MainKeyboard;
exports.MainKeyboard = MainKeyboard = __decorate([
    (0, common_1.Injectable)()
], MainKeyboard);
//# sourceMappingURL=main.keyboard.js.map
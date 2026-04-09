"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneUtil = void 0;
class PhoneUtil {
    static validate(phone) {
        const cleaned = this.format(phone);
        return /^998[0-9]{9}$/.test(cleaned);
    }
    static format(phone) {
        let cleaned = phone.replace(/[^0-9]/g, '');
        if (cleaned.length === 9) {
            cleaned = '998' + cleaned;
        }
        else if (cleaned.length === 13) {
            cleaned = cleaned.substring(1);
        }
        return cleaned;
    }
    static display(phone) {
        const cleaned = this.format(phone);
        if (cleaned.length === 12) {
            return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8, 10)} ${cleaned.substring(10, 12)}`;
        }
        return phone;
    }
    static mask(phone) {
        const cleaned = this.format(phone);
        if (cleaned.length === 12) {
            return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)}****${cleaned.substring(9, 12)}`;
        }
        return phone;
    }
    static getOperator(phone) {
        const cleaned = this.format(phone);
        if (cleaned.length === 12) {
            const code = cleaned.substring(3, 5);
            const operators = {
                '90': 'Beeline', '91': 'Beeline', '93': 'Ucell', '94': 'Ucell',
                '95': 'Uzmobile', '97': 'Mobiuz', '98': 'Perfectum', '99': 'Uzmobile',
                '33': 'Humans', '88': 'Mobiuz', '50': 'Ucell', '77': 'Beeline'
            };
            return operators[code] || 'Noma\'lum';
        }
        return 'Noma\'lum';
    }
}
exports.PhoneUtil = PhoneUtil;
//# sourceMappingURL=phone.util.js.map
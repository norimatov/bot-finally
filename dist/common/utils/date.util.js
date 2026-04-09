"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtil = void 0;
class DateUtil {
    static daysRemaining(endDate) {
        const diff = new Date(endDate).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    static isExpiringSoon(endDate, days) {
        return this.daysRemaining(endDate) <= days;
    }
    static getToday() {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }
    static getStartOfDay(date = new Date()) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    static getEndOfDay(date = new Date()) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    }
    static getDateRange(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date;
    }
    static formatDate(date, format = 'uz') {
        const locales = {
            uz: 'uz-UZ',
            ru: 'ru-RU',
            en: 'en-US'
        };
        return date.toLocaleDateString(locales[format], {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    static formatTime(date) {
        return date.toLocaleTimeString('uz-UZ', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    static formatFull(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    }
    static getMonthStart(date = new Date()) {
        const d = new Date(date);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    static getMonthEnd(date = new Date()) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + 1);
        d.setDate(0);
        d.setHours(23, 59, 59, 999);
        return d;
    }
    static getYearStart(date = new Date()) {
        const d = new Date(date);
        d.setMonth(0, 1);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    static getYearEnd(date = new Date()) {
        const d = new Date(date);
        d.setMonth(11, 31);
        d.setHours(23, 59, 59, 999);
        return d;
    }
    static getWeekStart(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? 6 : day - 1;
        d.setDate(d.getDate() - diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    static getWeekEnd(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? 0 : 7 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(23, 59, 59, 999);
        return d;
    }
    static getDaysBetween(startDate, endDate) {
        const start = this.getStartOfDay(startDate);
        const end = this.getStartOfDay(endDate);
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    static isSameDay(date1, date2) {
        return this.getStartOfDay(date1).getTime() === this.getStartOfDay(date2).getTime();
    }
    static getDaysAgo(date) {
        return this.getDaysBetween(date, new Date());
    }
    static isValidDate(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }
    static getMonthName(month, locale = 'uz') {
        const date = new Date(2000, month, 1);
        return date.toLocaleString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US', { month: 'long' });
    }
    static getDayName(day, locale = 'uz') {
        const date = new Date(2000, 0, day + 1);
        return date.toLocaleString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long' });
    }
}
exports.DateUtil = DateUtil;
//# sourceMappingURL=date.util.js.map
export declare class DateUtil {
    static daysRemaining(endDate: Date): number;
    static isExpiringSoon(endDate: Date, days: number): boolean;
    static getToday(): Date;
    static getStartOfDay(date?: Date): Date;
    static getEndOfDay(date?: Date): Date;
    static getDateRange(days: number): Date;
    static formatDate(date: Date, format?: 'uz' | 'ru' | 'en'): string;
    static formatTime(date: Date): string;
    static formatFull(date: Date): string;
    static getMonthStart(date?: Date): Date;
    static getMonthEnd(date?: Date): Date;
    static getYearStart(date?: Date): Date;
    static getYearEnd(date?: Date): Date;
    static getWeekStart(date?: Date): Date;
    static getWeekEnd(date?: Date): Date;
    static getDaysBetween(startDate: Date, endDate: Date): number;
    static isSameDay(date1: Date, date2: Date): boolean;
    static getDaysAgo(date: Date): number;
    static isValidDate(date: any): boolean;
    static getMonthName(month: number, locale?: 'uz' | 'ru' | 'en'): string;
    static getDayName(day: number, locale?: 'uz' | 'ru' | 'en'): string;
}

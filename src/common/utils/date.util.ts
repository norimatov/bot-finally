export class DateUtil {
  // ============== KUN QOLDIGINI HISOBLASH ==============
  static daysRemaining(endDate: Date): number {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  // ============== MUDDATI YAQINLASHGANINI TEKSHIRISH ==============
  static isExpiringSoon(endDate: Date, days: number): boolean {
    return this.daysRemaining(endDate) <= days;
  }

  // ============== BUGUNGI KUN (00:00:00) ==============
  static getToday(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // ============== KUN BOSHI (00:00:00) ==============
  static getStartOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ============== KUN OXIRI (23:59:59.999) ==============
  static getEndOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  // ============== SANADAN KUN QO'SHISH ==============
  static getDateRange(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  // ============== SANANI FORMATLASH ==============
  static formatDate(date: Date, format: 'uz' | 'ru' | 'en' = 'uz'): string {
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

  // ============== VAQTNI FORMATLASH ==============
  static formatTime(date: Date): string {
    return date.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // ============== SANANI TO'LIQ FORMATLASH ==============
  static formatFull(date: Date): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  // ============== OY BOSHI ==============
  static getMonthStart(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ============== OY OXIRI ==============
  static getMonthEnd(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  // ============== YIL BOSHI ==============
  static getYearStart(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ============== YIL OXIRI ==============
  static getYearEnd(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setMonth(11, 31);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  // ============== HAFTA BOSHI (Dushanba) ==============
  static getWeekStart(date: Date = new Date()): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0 - Yakshanba, 1 - Dushanba, ...
    const diff = day === 0 ? 6 : day - 1; // Dushanbagacha necha kun
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ============== HAFTA OXIRI (Yakshanba) ==============
  static getWeekEnd(date: Date = new Date()): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0 - Yakshanba, 1 - Dushanba, ...
    const diff = day === 0 ? 0 : 7 - day; // Yakshanbagacha necha kun
    d.setDate(d.getDate() + diff);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  // ============== IKKI SANA ORASIDAGI KUNLAR ==============
  static getDaysBetween(startDate: Date, endDate: Date): number {
    const start = this.getStartOfDay(startDate);
    const end = this.getStartOfDay(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // ============== SANANI QIYOSLASH (bir xil kunmi?) ==============
  static isSameDay(date1: Date, date2: Date): boolean {
    return this.getStartOfDay(date1).getTime() === this.getStartOfDay(date2).getTime();
  }

  // ============== SANANI YOSHI (necha kun oldin?) ==============
  static getDaysAgo(date: Date): number {
    return this.getDaysBetween(date, new Date());
  }

  // ============== SANANI TEKSHIRISH (validmi?) ==============
  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  // ============== OY NOMINI OLISH ==============
  static getMonthName(month: number, locale: 'uz' | 'ru' | 'en' = 'uz'): string {
    const date = new Date(2000, month, 1);
    return date.toLocaleString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US', { month: 'long' });
  }

  // ============== HAFTA KUNI NOMINI OLISH ==============
  static getDayName(day: number, locale: 'uz' | 'ru' | 'en' = 'uz'): string {
    const date = new Date(2000, 0, day + 1); // 0 - Yakshanba, 1 - Dushanba, ...
    return date.toLocaleString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long' });
  }
}
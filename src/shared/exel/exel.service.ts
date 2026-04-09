import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class ExcelService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly carsDir = path.join(this.uploadDir, 'cars');
  private readonly exportsDir = path.join(process.cwd(), 'exports');

  constructor() {
    // Uploads papkalarini yaratish (agar mavjud bo'lmasa)
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!fs.existsSync(this.carsDir)) {
      fs.mkdirSync(this.carsDir, { recursive: true });
    }
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }

    console.log('📁 ExcelService ishga tushdi');
    console.log('📁 Uploads papka:', this.uploadDir);
    console.log('📁 Cars papka:', this.carsDir);
    console.log('📁 Exports papka:', this.exportsDir);
  }

  /**
   * Umumiy hisobot (barcha ma'lumotlar)
   */
  async generateFullReport(data: any): Promise<string> {
    const workbook = new ExcelJS.Workbook();

    // Avtomobilar varag'i
    const carSheet = workbook.addWorksheet('Avtomobillar');
    await this.addCarSheet(carSheet, data.cars || []);

    // Leadlar varag'i
    const leadSheet = workbook.addWorksheet('Leadlar');
    await this.addLeadSheet(leadSheet, data.leads || []);

    // Foydalanuvchilar varag'i
    const userSheet = workbook.addWorksheet('Foydalanuvchilar');
    await this.addUserSheet(userSheet, data.users || []);

    // Statistika varag'i
    const statsSheet = workbook.addWorksheet('Statistika');
    await this.addStatsSheet(statsSheet, data);

    const fileName = `full_report_${Date.now()}.xlsx`;
    const filePath = path.join(this.exportsDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log('✅ Excel fayl yaratildi:', filePath);

    return filePath;
  }

  /**
   * Operator hisoboti
   */
  async generateOperatorReport(operators: any[]): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Operatorlar');

    worksheet.columns = [
      { header: '№', key: 'no', width: 5 },
      { header: 'F.I.O', key: 'name', width: 30 },
      { header: 'Yopilgan leadlar', key: 'closedLeads', width: 15 },
      { header: 'HOT leadlar', key: 'hot', width: 15 },
      { header: 'WARM leadlar', key: 'warm', width: 15 },
      { header: 'COLD leadlar', key: 'cold', width: 15 },
      { header: 'Jami daromad', key: 'totalEarned', width: 20 },
      { header: 'Konversiya', key: 'conversion', width: 15 },
    ];

    operators.forEach((op, index) => {
      worksheet.addRow({
        no: index + 1,
        name: op.name || op.firstName || 'Noma\'lum',
        closedLeads: op.closedLeads || 0,
        hot: op.hot || 0,
        warm: op.warm || 0,
        cold: op.cold || 0,
        totalEarned: (op.totalEarned || 0).toLocaleString() + ' soʻm',
        conversion: (op.conversionRate || 0) + '%'
      });
    });

    this.formatHeaderRow(worksheet);

    const fileName = `operator_report_${Date.now()}.xlsx`;
    const filePath = path.join(this.exportsDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log('✅ Operator hisoboti yaratildi:', filePath);

    return filePath;
  }

  /**
   * Lead hisoboti (IKKINCHI TELEFON QO'SHILDI)
   */
  async generateLeadReport(leads: any[]): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leadlar');

    worksheet.columns = [
      { header: '№', key: 'no', width: 5 },
      { header: 'Avtomobil raqami', key: 'plateNumber', width: 15 },
      { header: '➕ Ikkinchi raqam', key: 'secondPlateNumber', width: 15 },
      { header: 'Avtomobil egasi', key: 'ownerName', width: 20 },
      { header: 'Asosiy telefon', key: 'phone', width: 15 },
      { header: '📞 Ikkinchi telefon', key: 'secondPhone', width: 15 },
      { header: 'Lead turi', key: 'type', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Operator', key: 'operator', width: 20 },
      { header: 'Qolgan kun', key: 'daysLeft', width: 10 },
      { header: 'Sug\'urta tugash sanasi', key: 'endDate', width: 15 },
      { header: 'Yaratilgan sana', key: 'createdAt', width: 15 },
    ];

    leads.forEach((lead, index) => {
      const typeIcon = lead.leadType === 'HOT' ? '🔥' : lead.leadType === 'WARM' ? '🌤' : '❄️';

      worksheet.addRow({
        no: index + 1,
        plateNumber: lead.car?.plateNumber || 'Noma\'lum',
        secondPlateNumber: lead.car?.secondPlateNumber || '-',
        ownerName: lead.car?.ownerName || 'Noma\'lum',
        phone: lead.car?.ownerPhone || 'Noma\'lum',
        secondPhone: lead.car?.secondPhone || '-',
        type: typeIcon + ' ' + (lead.leadType || 'Noma\'lum'),
        status: this.getStatusText(lead.status),
        operator: lead.operator?.firstName || lead.operator?.username || 'Tayinlanmagan',
        daysLeft: lead.daysRemaining || 0,
        endDate: lead.insurance?.endDate ? new Date(lead.insurance.endDate).toLocaleDateString('uz-UZ') : '-',
        createdAt: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('uz-UZ') : '-'
      });
    });

    this.formatHeaderRow(worksheet);

    const fileName = `lead_report_${Date.now()}.xlsx`;
    const filePath = path.join(this.exportsDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log('✅ Lead hisoboti yaratildi:', filePath);

    return filePath;
  }

  /**
   * 🔥 Avtomobil hisoboti (3 TA RASM + IKKINCHI TELEFON)
   */
  async generateCarReport(cars: any[]): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Avtomobillar');

    worksheet.columns = [
      { header: '№', key: 'no', width: 5 },
      { header: 'Asosiy raqam', key: 'plateNumber', width: 15 },
      { header: '➕ Ikkinchi raqam', key: 'secondPlateNumber', width: 15 },
      { header: 'Avtomobil egasi', key: 'ownerName', width: 25 },
      { header: 'Asosiy telefon', key: 'phone', width: 15 },
      { header: '📞 Ikkinchi telefon', key: 'secondPhone', width: 15 },
      { header: '📸 Tex old', key: 'techPhoto', width: 15 },
      { header: '📸 Tex orqa', key: 'techBackPhoto', width: 15 },
      { header: '📸 Mashina', key: 'carPhoto', width: 15 },
      { header: 'Sug\'urta holati', key: 'insuranceStatus', width: 15 },
      { header: 'Sug\'urta turi', key: 'insuranceType', width: 12 },
      { header: 'Sug\'urta tugash sanasi', key: 'endDate', width: 15 },
      { header: 'Qolgan kun', key: 'daysLeft', width: 10 },
      { header: 'Registrator', key: 'registrar', width: 20 },
      { header: 'Qo\'shilgan sana', key: 'createdAt', width: 15 },
    ];

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      const activeInsurance = car.insurances?.find(i => i.status === 'active');
      const daysLeft = activeInsurance ? this.calculateDaysLeft(activeInsurance.endDate) : 0;

      const insuranceTypeText = activeInsurance?.type ? {
        '24days': '24 kun',
        '6months': '6 oy',
        '1year': '1 yil',
        'custom': 'Maxsus'
      }[activeInsurance.type] || 'Standart' : '-';

      let insuranceStatus = '❌ Yo\'q';
      if (activeInsurance) {
        if (daysLeft < 0) insuranceStatus = '❌ Muddati o\'tgan';
        else if (daysLeft <= 10) insuranceStatus = '🔥 ' + daysLeft + ' kun';
        else if (daysLeft <= 30) insuranceStatus = '🌤 ' + daysLeft + ' kun';
        else insuranceStatus = '✅ Aktiv';
      }

      // 🔥 3 TA RASM URL LARI
      const techPhotoFullUrl = car.techPhoto ? `${baseUrl}${car.techPhoto}` : null;
      const techBackPhotoFullUrl = car.techBackPhoto ? `${baseUrl}${car.techBackPhoto}` : null;
      const carPhotoFullUrl = car.carPhoto ? `${baseUrl}${car.carPhoto}` : null;

      // Debug: rasm yo'llarini tekshirish
      console.log(`🚗 ${car.plateNumber}:`);
      console.log(`  📞 Asosiy tel: ${car.ownerPhone}`);
      console.log(`  📞 Ikkinchi tel: ${car.secondPhone}`);
      console.log(`  📸 Tex old: ${car.techPhoto} -> ${techPhotoFullUrl}`);
      console.log(`  📸 Tex orqa: ${car.techBackPhoto} -> ${techBackPhotoFullUrl}`);
      console.log(`  📸 Mashina: ${car.carPhoto} -> ${carPhotoFullUrl}`);

      const row = worksheet.addRow({
        no: i + 1,
        plateNumber: car.plateNumber || 'Noma\'lum',
        secondPlateNumber: car.secondPlateNumber || '-',
        ownerName: car.ownerName || 'Noma\'lum',
        phone: car.ownerPhone || 'Noma\'lum',
        secondPhone: car.secondPhone || '-',
        techPhoto: car.techPhoto ? '📸 Bor' : '❌ Yo\'q',
        techBackPhoto: car.techBackPhoto ? '📸 Bor' : '❌ Yo\'q',
        carPhoto: car.carPhoto ? '📸 Bor' : '❌ Yo\'q',
        insuranceStatus: insuranceStatus,
        insuranceType: insuranceTypeText,
        endDate: activeInsurance ? new Date(activeInsurance.endDate).toLocaleDateString('uz-UZ') : '-',
        daysLeft: daysLeft < 0 ? 0 : daysLeft,
        registrar: car.createdBy?.firstName || car.createdBy?.username || 'Noma\'lum',
        createdAt: car.createdAt ? new Date(car.createdAt).toLocaleDateString('uz-UZ') : '-'
      });

      // 🔥 3 TA RASM URL LARINI HYPERLINK QILISH
      if (car.techPhoto) {
        const fullUrl = this.getFullUrl(car.techPhoto);
        console.log(`  🔗 Tex old URL: ${fullUrl}`);

        const techCell = row.getCell('techPhoto');
        techCell.value = { text: '📸 Ko\'rish', hyperlink: fullUrl };
        techCell.font = { color: { argb: 'FF0000FF' }, underline: true };
      }

      if (car.techBackPhoto) {
        const fullUrl = this.getFullUrl(car.techBackPhoto);
        console.log(`  🔗 Tex orqa URL: ${fullUrl}`);

        const techBackCell = row.getCell('techBackPhoto');
        techBackCell.value = { text: '📸 Ko\'rish', hyperlink: fullUrl };
        techBackCell.font = { color: { argb: 'FF0000FF' }, underline: true };
      }

      if (car.carPhoto) {
        const fullUrl = this.getFullUrl(car.carPhoto);
        console.log(`  🔗 Mashina URL: ${fullUrl}`);

        const carCell = row.getCell('carPhoto');
        carCell.value = { text: '📸 Ko\'rish', hyperlink: fullUrl };
        carCell.font = { color: { argb: 'FF0000FF' }, underline: true };
      }
    }

    this.formatHeaderRow(worksheet);

    const fileName = `car_report_${Date.now()}.xlsx`;
    const filePath = path.join(this.exportsDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log('✅ Avtomobil hisoboti yaratildi:', filePath);

    return filePath;
  }

  /**
   * Moliya hisoboti
   */
  async generateFinanceReport(data: any): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Moliya');

    worksheet.columns = [
      { header: 'Ko\'rsatkich', key: 'indicator', width: 30 },
      { header: 'Qiymat', key: 'value', width: 25 },
    ];

    worksheet.addRow({ indicator: '📅 Kunlik daromad', value: (data.yearStats?.amount > 0 ? (data.yearStats.amount / 365).toFixed(0) : 0) + ' soʻm' });
    worksheet.addRow({ indicator: '📆 Oylik daromad', value: (data.monthTotal || 0).toLocaleString() + ' soʻm' });
    worksheet.addRow({ indicator: '📊 Yillik daromad', value: (data.yearStats?.amount || 0).toLocaleString() + ' soʻm' });
    worksheet.addRow({ indicator: '👥 To\'lov kutilayotganlar', value: (data.pendingPayments?.length || 0) + ' ta' });

    worksheet.addRow({});
    worksheet.addRow({ indicator: 'Kutilayotgan to\'lovlar:', value: '' });

    (data.pendingPayments || []).slice(0, 10).forEach((p: any) => {
      worksheet.addRow({
        indicator: '  • ' + (p.name || 'Noma\'lum'),
        value: (p.amount || 0).toLocaleString() + ' soʻm'
      });
    });

    this.formatHeaderRow(worksheet);

    const fileName = `finance_report_${Date.now()}.xlsx`;
    const filePath = path.join(this.exportsDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log('✅ Moliya hisoboti yaratildi:', filePath);

    return filePath;
  }

  /**
   * 🔥 Avtomobillar ro'yxati (3 TA RASM + IKKINCHI TELEFON)
   */
  async generateCarListReport(cars: any[]): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Avtomobillar');

    worksheet.columns = [
      { header: '№', key: 'no', width: 5 },
      { header: 'Asosiy raqam', key: 'plateNumber', width: 15 },
      { header: '➕ Ikkinchi raqam', key: 'secondPlateNumber', width: 15 },
      { header: 'Avtomobil egasi', key: 'ownerName', width: 25 },
      { header: 'Asosiy telefon', key: 'phone', width: 15 },
      { header: '📞 Ikkinchi telefon', key: 'secondPhone', width: 15 },
      { header: '📸 Tex old', key: 'techPhoto', width: 15 },
      { header: '📸 Tex orqa', key: 'techBackPhoto', width: 15 },
      { header: '📸 Mashina', key: 'carPhoto', width: 15 },
      { header: 'Sug\'urta holati', key: 'status', width: 15 },
      { header: 'Sug\'urta tugash sanasi', key: 'endDate', width: 15 },
    ];

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    cars.forEach((car, index) => {
      const activeInsurance = car.insurances?.find(i => i.status === 'active');
      const status = activeInsurance ? '✅ Aktiv' : '❌ Yo\'q';

      // 🔥 3 TA RASM URL LARI
      const techPhotoFullUrl = car.techPhoto ? `${baseUrl}${car.techPhoto}` : null;
      const techBackPhotoFullUrl = car.techBackPhoto ? `${baseUrl}${car.techBackPhoto}` : null;
      const carPhotoFullUrl = car.carPhoto ? `${baseUrl}${car.carPhoto}` : null;

      const row = worksheet.addRow({
        no: index + 1,
        plateNumber: car.plateNumber || 'Noma\'lum',
        secondPlateNumber: car.secondPlateNumber || '-',
        ownerName: car.ownerName || 'Noma\'lum',
        phone: car.ownerPhone || 'Noma\'lum',
        secondPhone: car.secondPhone || '-',
        techPhoto: car.techPhoto ? '📸 Bor' : '❌ Yo\'q',
        techBackPhoto: car.techBackPhoto ? '📸 Bor' : '❌ Yo\'q',
        carPhoto: car.carPhoto ? '📸 Bor' : '❌ Yo\'q',
        status: status,
        endDate: activeInsurance ? new Date(activeInsurance.endDate).toLocaleDateString('uz-UZ') : '-'
      });

      // 🔥 3 TA RASM URL LARINI HYPERLINK QILISH
      if (car.techPhoto) {
        const fullUrl = this.getFullUrl(car.techPhoto);
        const techCell = row.getCell('techPhoto');
        techCell.value = { text: '📸 Ko\'rish', hyperlink: fullUrl };
        techCell.font = { color: { argb: 'FF0000FF' }, underline: true };
      }

      if (car.techBackPhoto) {
        const fullUrl = this.getFullUrl(car.techBackPhoto);
        const techBackCell = row.getCell('techBackPhoto');
        techBackCell.value = { text: '📸 Ko\'rish', hyperlink: fullUrl };
        techBackCell.font = { color: { argb: 'FF0000FF' }, underline: true };
      }

      if (car.carPhoto) {
        const fullUrl = this.getFullUrl(car.carPhoto);
        const carCell = row.getCell('carPhoto');
        carCell.value = { text: '📸 Ko\'rish', hyperlink: fullUrl };
        carCell.font = { color: { argb: 'FF0000FF' }, underline: true };
      }
    });

    this.formatHeaderRow(worksheet);

    const fileName = `car_list_${Date.now()}.xlsx`;
    const filePath = path.join(this.exportsDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log('✅ Avtomobil ro\'yxati yaratildi:', filePath);

    return filePath;
  }

  /**
   * Sug'urta turlari bo'yicha hisobot - IKKINCHI TELEFON QO'SHILDI
   */
  async generateInsuranceTypeReport(insurances: any[]): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sug\'urtalar');

    worksheet.columns = [
      { header: '№', key: 'no', width: 5 },
      { header: 'Avtomobil raqami', key: 'plateNumber', width: 15 },
      { header: 'Ikkinchi raqam', key: 'secondPlateNumber', width: 15 },
      { header: 'Avtomobil egasi', key: 'ownerName', width: 20 },
      { header: 'Asosiy telefon', key: 'phone', width: 15 },
      { header: '📞 Ikkinchi telefon', key: 'secondPhone', width: 15 },
      { header: 'Sug\'urta turi', key: 'type', width: 12 },
      { header: 'Boshlanish sanasi', key: 'startDate', width: 15 },
      { header: 'Tugash sanasi', key: 'endDate', width: 15 },
      { header: 'Qolgan kun', key: 'daysLeft', width: 10 },
      { header: 'Holati', key: 'status', width: 12 },
    ];

    insurances.forEach((ins, index) => {
      const daysLeft = this.calculateDaysLeft(ins.endDate);
      const typeText = {
        '24days': '24 kun',
        '6months': '6 oy',
        '1year': '1 yil',
        'custom': 'Maxsus'
      }[ins.type] || 'Standart';

      const statusIcon = ins.status === 'active'
        ? (daysLeft <= 10 ? '🔥' : daysLeft <= 30 ? '🌤' : '✅')
        : '❌';

      worksheet.addRow({
        no: index + 1,
        plateNumber: ins.car?.plateNumber || 'Noma\'lum',
        secondPlateNumber: ins.car?.secondPlateNumber || '-',
        ownerName: ins.car?.ownerName || 'Noma\'lum',
        phone: ins.car?.ownerPhone || 'Noma\'lum',
        secondPhone: ins.car?.secondPhone || '-',
        type: typeText,
        startDate: new Date(ins.startDate).toLocaleDateString('uz-UZ'),
        endDate: new Date(ins.endDate).toLocaleDateString('uz-UZ'),
        daysLeft: daysLeft,
        status: statusIcon + ' ' + ins.status
      });
    });

    this.formatHeaderRow(worksheet);

    const fileName = `insurance_type_report_${Date.now()}.xlsx`;
    const filePath = path.join(this.exportsDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log('✅ Sug\'urta hisoboti yaratildi:', filePath);

    return filePath;
  }

  //! ============== BACKWARD COMPATIBILITY METODLARI ==============

  async exportToExcel(data: any[], type: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(type);

    if (data.length === 0) {
      worksheet.addRow(['No data']);
    } else {
      const headers = Object.keys(data[0]);
      worksheet.columns = headers.map(header => ({
        header: this.formatHeader(header),
        key: header,
        width: 20
      }));

      data.forEach(item => {
        worksheet.addRow(item);
      });

      this.formatHeaderRow(worksheet);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as any;
  }

  async exportUserRating(users: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Rating');

    worksheet.columns = [
      { header: 'Reyting', key: 'rank', width: 10 },
      { header: 'Ism', key: 'name', width: 30 },
      { header: 'Rol', key: 'role', width: 15 },
      { header: 'Avtomobillar', key: 'carsAdded', width: 15 },
      { header: 'Leadlar', key: 'leadsClosed', width: 15 },
      { header: 'Daromad', key: 'totalEarned', width: 20 }
    ];

    users.forEach(user => {
      worksheet.addRow({
        rank: user.rank,
        name: user.name,
        role: user.role,
        carsAdded: user.carsAdded,
        leadsClosed: user.leadsClosed,
        totalEarned: `${user.totalEarned.toLocaleString()} so'm`
      });
    });

    this.formatHeaderRow(worksheet);

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as any;
  }

  //! ============== YORDAMCHI METODLAR ==============

  private formatHeaderRow(worksheet: ExcelJS.Worksheet): void {
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  }

  private formatHeader(header: string): string {
    return header
      .split(/(?=[A-Z])/)
      .join(' ')
      .replace(/^\w/, c => c.toUpperCase());
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'new': '🆕 Yangi',
      'in_progress': '🔄 Jarayonda',
      'closed': '✅ Yopilgan',
      'rejected': '✖ Rad etilgan',
      'postponed': '⏳ Keyinga qoldirilgan'
    };
    return statusMap[status] || status || 'Noma\'lum';
  }

  private calculateDaysLeft(endDate: Date | string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 🔥 Rasm URL'ini yaratish (YANGILANGAN)
   */
  private getFullUrl(relativePath: string): string {
    if (!relativePath) return '#';
    if (relativePath.startsWith('http')) return relativePath;

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}${relativePath}`;

    console.log(`🔗 Generated URL: ${fullUrl}`);
    return fullUrl;
  }

  //! ============== PRIVATE SHEET METODLARI ==============

  private async addCarSheet(sheet: ExcelJS.Worksheet, cars: any[]): Promise<void> {
    sheet.columns = [
      { header: '№', key: 'no', width: 5 },
      { header: 'Asosiy raqam', key: 'plateNumber', width: 15 },
      { header: '➕ Ikkinchi raqam', key: 'secondPlateNumber', width: 15 },
      { header: 'Avtomobil egasi', key: 'ownerName', width: 20 },
      { header: 'Asosiy telefon', key: 'phone', width: 15 },
      { header: '📞 Ikkinchi telefon', key: 'secondPhone', width: 15 },
      { header: '📸 Tex old', key: 'techPhoto', width: 15 },
      { header: '📸 Tex orqa', key: 'techBackPhoto', width: 15 },
      { header: '📸 Mashina', key: 'carPhoto', width: 15 },
      { header: 'Sug\'urta holati', key: 'status', width: 15 },
      { header: 'Sug\'urta tugash sanasi', key: 'endDate', width: 15 },
    ];

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';

    cars.forEach((car, index) => {
      const activeInsurance = car.insurances?.find(i => i.status === 'active');
      const status = activeInsurance ? '✅ Aktiv' : '❌ Yo\'q';

      const row = sheet.addRow({
        no: index + 1,
        plateNumber: car.plateNumber || 'Noma\'lum',
        secondPlateNumber: car.secondPlateNumber || '-',
        ownerName: car.ownerName || 'Noma\'lum',
        phone: car.ownerPhone || 'Noma\'lum',
        secondPhone: car.secondPhone || '-',
        techPhoto: car.techPhoto ? '📸 Bor' : '❌ Yo\'q',
        techBackPhoto: car.techBackPhoto ? '📸 Bor' : '❌ Yo\'q',
        carPhoto: car.carPhoto ? '📸 Bor' : '❌ Yo\'q',
        status: status,
        endDate: activeInsurance ? new Date(activeInsurance.endDate).toLocaleDateString('uz-UZ') : '-'
      });

      if (car.techPhoto) {
        const fullUrl = this.getFullUrl(car.techPhoto);
        const techCell = row.getCell('techPhoto');
        techCell.value = { text: '📸 Ko\'rish', hyperlink: fullUrl };
        techCell.font = { color: { argb: 'FF0000FF' }, underline: true };
      }

      if (car.techBackPhoto) {
        const fullUrl = this.getFullUrl(car.techBackPhoto);
        const techBackCell = row.getCell('techBackPhoto');
        techBackCell.value = { text: '📸 Ko\'rish', hyperlink: fullUrl };
        techBackCell.font = { color: { argb: 'FF0000FF' }, underline: true };
      }

      if (car.carPhoto) {
        const fullUrl = this.getFullUrl(car.carPhoto);
        const carCell = row.getCell('carPhoto');
        carCell.value = { text: '📸 Ko\'rish', hyperlink: fullUrl };
        carCell.font = { color: { argb: 'FF0000FF' }, underline: true };
      }
    });

    this.formatHeaderRow(sheet);
  }

  private async addLeadSheet(sheet: ExcelJS.Worksheet, leads: any[]): Promise<void> {
    sheet.columns = [
      { header: '№', key: 'no', width: 5 },
      { header: 'Avtomobil raqami', key: 'plateNumber', width: 15 },
      { header: '➕ Ikkinchi raqam', key: 'secondPlateNumber', width: 15 },
      { header: 'Avtomobil egasi', key: 'ownerName', width: 20 },
      { header: 'Asosiy telefon', key: 'phone', width: 15 },
      { header: '📞 Ikkinchi telefon', key: 'secondPhone', width: 15 },
      { header: 'Lead turi', key: 'type', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Operator', key: 'operator', width: 20 },
    ];

    leads.forEach((lead, index) => {
      const typeIcon = lead.leadType === 'HOT' ? '🔥' : lead.leadType === 'WARM' ? '🌤' : '❄️';

      sheet.addRow({
        no: index + 1,
        plateNumber: lead.car?.plateNumber || 'Noma\'lum',
        secondPlateNumber: lead.car?.secondPlateNumber || '-',
        ownerName: lead.car?.ownerName || 'Noma\'lum',
        phone: lead.car?.ownerPhone || 'Noma\'lum',
        secondPhone: lead.car?.secondPhone || '-',
        type: typeIcon + ' ' + (lead.leadType || 'Noma\'lum'),
        status: this.getStatusText(lead.status),
        operator: lead.operator?.firstName || lead.operator?.username || 'Tayinlanmagan'
      });
    });

    this.formatHeaderRow(sheet);
  }

  private async addUserSheet(sheet: ExcelJS.Worksheet, users: any[]): Promise<void> {
    sheet.columns = [
      { header: '№', key: 'no', width: 5 },
      { header: 'F.I.O', key: 'name', width: 25 },
      { header: 'Telegram ID', key: 'telegramId', width: 15 },
      { header: 'Rol', key: 'role', width: 12 },
      { header: 'Telefon', key: 'phone', width: 15 },
    ];

    users.forEach((user, index) => {
      const roleIcon = user.role === 'admin' ? '👑' : user.role === 'operator' ? '🎮' : '📋';

      sheet.addRow({
        no: index + 1,
        name: user.firstName || user.username || 'Noma\'lum',
        telegramId: user.telegramId || '-',
        role: roleIcon + ' ' + (user.role || 'Noma\'lum'),
        phone: user.phone || '-'
      });
    });

    this.formatHeaderRow(sheet);
  }

  private async addStatsSheet(sheet: ExcelJS.Worksheet, data: any): Promise<void> {
    sheet.columns = [
      { header: 'Ko\'rsatkich', key: 'indicator', width: 30 },
      { header: 'Qiymat', key: 'value', width: 25 },
    ];

    // 🔥 3 TA RASM BO'YICHA STATISTIKA
    const carsWithTechPhoto = data.cars?.filter((c: any) => c.techPhoto).length || 0;
    const carsWithTechBackPhoto = data.cars?.filter((c: any) => c.techBackPhoto).length || 0;
    const carsWithCarPhoto = data.cars?.filter((c: any) => c.carPhoto).length || 0;
    const carsWithAllPhotos = data.cars?.filter((c: any) => c.techPhoto && c.techBackPhoto && c.carPhoto).length || 0;

    const carsWithSecondPhone = data.cars?.filter((c: any) => c.secondPhone && c.secondPhone !== '-').length || 0;
    const carsWithSecondPlate = data.cars?.filter((c: any) => c.secondPlateNumber && c.secondPlateNumber !== '-').length || 0;

    sheet.addRow({ indicator: '📅 Sana', value: new Date().toLocaleDateString('uz-UZ') });
    sheet.addRow({});
    sheet.addRow({ indicator: '🚗 Jami avtomobillar', value: (data.cars?.length || 0) + ' ta' });
    sheet.addRow({ indicator: '   • Ikkinchi raqamli', value: carsWithSecondPlate + ' ta' });
    sheet.addRow({ indicator: '   • Ikkinchi telefonli', value: carsWithSecondPhone + ' ta' });
    sheet.addRow({ indicator: '   • Tex old rasmi bor', value: carsWithTechPhoto + ' ta' });
    sheet.addRow({ indicator: '   • Tex orqa rasmi bor', value: carsWithTechBackPhoto + ' ta' });
    sheet.addRow({ indicator: '   • Mashina rasmi bor', value: carsWithCarPhoto + ' ta' });
    sheet.addRow({ indicator: '   • 3 ta rasmli', value: carsWithAllPhotos + ' ta' });
    sheet.addRow({ indicator: '📋 Jami leadlar', value: (data.leads?.length || 0) + ' ta' });
    sheet.addRow({ indicator: '👥 Jami foydalanuvchilar', value: (data.users?.length || 0) + ' ta' });

    this.formatHeaderRow(sheet);
  }
}
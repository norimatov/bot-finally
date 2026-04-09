import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, IsNull, In, Not } from 'typeorm';
import { Car } from '../../database/entities/car.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { DateUtil } from '../../common/utils/date.util';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car) private carRepo: Repository<Car>,
    @InjectRepository(CarInsurance) private insuranceRepo: Repository<CarInsurance>,
  ) {}

  // ============== ASOSIY CRUD METODLAR ==============

  /**
   * Barcha avtomobillarni olish
   */
  async findAll(): Promise<Car[]> {
    return this.carRepo.find({ 
      relations: ['createdBy', 'insurances', 'submittedBy', 'moderatedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Bitta avtomobilni olish
   */
  async findOne(id: number): Promise<Car> {
    return this.carRepo.findOne({ 
      where: { id },
      relations: ['createdBy', 'insurances', 'submittedBy', 'moderatedBy']
    });
  }

  /**
   * Avtomobilni raqam bo'yicha topish (asosiy raqam)
   */
  async findByPlate(plateNumber: string): Promise<Car> {
    return this.carRepo.findOne({ 
      where: { plateNumber },
      relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy']
    });
  }

  /**
   * Avtomobilni ikkinchi raqam bo'yicha topish
   */
  async findBySecondPlate(secondPlateNumber: string): Promise<Car> {
    return this.carRepo.findOne({ 
      where: { secondPlateNumber },
      relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy']
    });
  }

  /**
   * Avtomobilni istalgan raqam bo'yicha topish (asosiy yoki ikkinchi)
   */
  async findByAnyPlate(plateNumber: string): Promise<Car> {
    return this.carRepo.findOne({ 
      where: [
        { plateNumber },
        { secondPlateNumber: plateNumber }
      ],
      relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy']
    });
  }

  /**
   * Telefon raqam bo'yicha qidirish (asosiy yoki ikkinchi telefon)
   */
  async findByPhone(phone: string): Promise<Car[]> {
    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
    
    return this.carRepo.find({
      where: [
        { ownerPhone: formattedPhone },
        { secondPhone: formattedPhone }
      ],
      relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Yangi avtomobil yaratish
   */
  async create(carData: Partial<Car>): Promise<Car> {
    const car = this.carRepo.create(carData);
    return this.carRepo.save(car);
  }

  /**
   * Avtomobilni yangilash
   */
  async update(id: number, carData: Partial<Car>): Promise<Car> {
    await this.carRepo.update(id, carData);
    return this.findOne(id);
  }

  /**
   * Avtomobil rasmlarini yangilash
   */
  async updatePhotos(id: number, photos: { techPhoto?: string; carPhoto?: string }): Promise<Car> {
    await this.carRepo.update(id, photos);
    return this.findOne(id);
  }

  /**
   * Avtomobilni o'chirish
   */
  async delete(id: number): Promise<void> {
    await this.carRepo.delete(id);
  }

  // ============== FILTR METODLARI ==============

  /**
   * Foydalanuvchi bo'yicha avtomobillar
   */
  async findByUser(userId: number): Promise<Car[]> {
    return this.carRepo.find({
      where: { createdById: userId },
      relations: ['insurances', 'submittedBy', 'moderatedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Bir necha ID bo'yicha avtomobillarni olish
   */
  async findByIds(ids: number[]): Promise<Car[]> {
    return this.carRepo.find({
      where: { id: In(ids) },
      relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy']
    });
  }

  /**
   * Oxirgi qo'shilgan avtomobillar
   */
  async getRecentCars(limit: number = 10): Promise<Car[]> {
    return this.carRepo.find({
      relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy'],
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  /**
   * Avtomobil va sug'urtalari (barchasi)
   */
  async findAllWithInsurances(): Promise<Car[]> {
    return this.carRepo.find({
      relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  // 🔥 ============== MODERATSIYA METODLARI ==============

  /**
   * Moderatsiya kutilayotgan avtomobillar
   */
  async getPendingCars(): Promise<Car[]> {
    return this.carRepo.find({
      where: { moderationStatus: 'pending' },
      relations: ['insurances', 'submittedBy'],
      order: { createdAt: 'ASC' }
    });
  }

  /**
   * Tasdiqlangan avtomobillar
   */
  async getApprovedCars(): Promise<Car[]> {
    return this.carRepo.find({
      where: { moderationStatus: 'approved' },
      relations: ['insurances', 'submittedBy', 'moderatedBy'],
      order: { moderatedAt: 'DESC' }
    });
  }

  /**
   * Rad etilgan avtomobillar
   */
  async getRejectedCars(): Promise<Car[]> {
    return this.carRepo.find({
      where: { moderationStatus: 'rejected' },
      relations: ['insurances', 'submittedBy', 'moderatedBy'],
      order: { moderatedAt: 'DESC' }
    });
  }

  /**
   * Avtomobilni tasdiqlash
   */
  async approveCar(id: number, moderatorId: number): Promise<Car> {
    await this.carRepo.update(id, {
      moderationStatus: 'approved',
      moderatedById: moderatorId,
      moderatedAt: new Date()
    });
    return this.findOne(id);
  }

  /**
   * Avtomobilni rad etish
   */
  async rejectCar(id: number, moderatorId: number, reason: string): Promise<Car> {
    await this.carRepo.update(id, {
      moderationStatus: 'rejected',
      moderatedById: moderatorId,
      moderatedAt: new Date(),
      rejectionReason: reason
    });
    return this.findOne(id);
  }

  /**
   * Registrator tomonidan yuborilgan avtomobillar
   */
  async getCarsBySubmitter(registrarId: number): Promise<Car[]> {
    return this.carRepo.find({
      where: { submittedById: registrarId },
      relations: ['insurances', 'moderatedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Operator tomonidan moderatsiya qilingan avtomobillar
   */
  async getCarsModeratedBy(operatorId: number): Promise<Car[]> {
    return this.carRepo.find({
      where: { moderatedById: operatorId },
      relations: ['insurances', 'submittedBy'],
      order: { moderatedAt: 'DESC' }
    });
  }

  /**
   * Moderatsiya statistikasi
   */
  async getModerationStats(): Promise<any> {
    const [pending, approved, rejected, total] = await Promise.all([
      this.carRepo.count({ where: { moderationStatus: 'pending' } }),
      this.carRepo.count({ where: { moderationStatus: 'approved' } }),
      this.carRepo.count({ where: { moderationStatus: 'rejected' } }),
      this.carRepo.count()
    ]);

    return {
      pending,
      approved,
      rejected,
      total,
      approvalRate: total > 0 ? Number(((approved / total) * 100).toFixed(1)) : 0,
      rejectionRate: total > 0 ? Number(((rejected / total) * 100).toFixed(1)) : 0
    };
  }

  /**
   * Eski rad etilgan avtomobillarni tozalash (30 kundan eskilari)
   */
  async cleanOldRejected(days: number = 30): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await this.carRepo
      .createQueryBuilder()
      .delete()
      .where('moderationStatus = :status', { status: 'rejected' })
      .andWhere('moderatedAt < :date', { date })
      .execute();

    return result.affected || 0;
  }

  // ============== SUG'URTA METODLARI ==============

  /**
   * SUG'URTA MUDDATI TUGAYDIGANLAR (masalan: 30 kun ichida)
   * @param days - necha kun ichida tugashi (masalan: 30, 15, 7)
   */
  async getExpiringCars(days: number): Promise<Car[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    targetDate.setHours(23, 59, 59, 999);
    
    const insurances = await this.insuranceRepo.find({
      where: {
        endDate: Between(today, targetDate),
        status: 'active'
      },
      relations: ['car'],
      order: { endDate: 'ASC' }
    });
    
    return insurances
      .map(i => i.car)
      .filter(car => car !== null);
  }

  /**
   * MUDDATI O'TGAN AVTOMOBILLAR
   */
  async getExpiredCars(): Promise<Car[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const insurances = await this.insuranceRepo.find({
      where: {
        endDate: LessThan(today),
        status: 'expired'
      },
      relations: ['car'],
      order: { endDate: 'DESC' }
    });
    
    return insurances
      .map(i => i.car)
      .filter(car => car !== null);
  }

  /**
   * AKTIV SUG'URTALI AVTOMOBILLAR
   */
  async getActiveInsuredCars(): Promise<Car[]> {
    const insurances = await this.insuranceRepo.find({
      where: { status: 'active' },
      relations: ['car'],
      order: { endDate: 'ASC' }
    });
    
    return insurances
      .map(i => i.car)
      .filter(car => car !== null);
  }

  /**
   * SUG'URTASI BO'LMAGAN AVTOMOBILLAR
   */
  async getCarsWithoutInsurance(): Promise<Car[]> {
    const carsWithInsurance = await this.insuranceRepo
      .createQueryBuilder('insurance')
      .select('insurance.carId')
      .where('insurance.status = :status', { status: 'active' })
      .getMany();
    
    const insuredCarIds = carsWithInsurance.map(i => i.carId);
    
    if (insuredCarIds.length === 0) {
      return this.carRepo.find({
        relations: ['createdBy', 'submittedBy', 'moderatedBy'],
        order: { createdAt: 'DESC' }
      });
    }
    
    return this.carRepo
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.createdBy', 'user')
      .leftJoinAndSelect('car.submittedBy', 'submittedBy')
      .leftJoinAndSelect('car.moderatedBy', 'moderatedBy')
      .where('car.id NOT IN (:...ids)', { ids: insuredCarIds })
      .orderBy('car.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Sug'urtasi tugaydiganlar soni
   */
  async getExpiringCount(days: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    targetDate.setHours(23, 59, 59, 999);
    
    return this.insuranceRepo.count({
      where: {
        endDate: Between(today, targetDate),
        status: 'active'
      }
    });
  }

  /**
   * Muddati o'tganlar soni
   */
  async getExpiredCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.insuranceRepo.count({
      where: {
        endDate: LessThan(today),
        status: 'expired'
      }
    });
  }

  // ============== STATISTIKA METODLARI ==============

  /**
   * Bugun qo'shilgan avtomobillar soni
   */
  async getTodayCount(): Promise<number> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.carRepo.count({
      where: { createdAt: Between(today, tomorrow) }
    });
  }

  /**
   * Shu oyda qo'shilgan avtomobillar soni
   */
  async getMonthCount(): Promise<number> {
    const monthStart = DateUtil.getMonthStart();
    const monthEnd = DateUtil.getMonthEnd();
    
    return this.carRepo.count({
      where: { createdAt: Between(monthStart, monthEnd) }
    });
  }

  /**
   * Umumiy statistika
   */
  async getCarStats(): Promise<any> {
    const today = DateUtil.getToday();
    const monthStart = DateUtil.getMonthStart();
    const monthEnd = DateUtil.getMonthEnd();
    
    const [
      total,
      todayCount,
      monthCount,
      activeCount,
      expiringCount,
      expiredCount,
      withSecondPlate,
      withPhotos,
      withGuarantor,
      withSecondPhone,
      pendingCount,
      approvedCount,
      rejectedCount
    ] = await Promise.all([
      this.carRepo.count(),
      this.carRepo.count({ 
        where: { createdAt: Between(today, new Date()) } 
      }),
      this.carRepo.count({ 
        where: { createdAt: Between(monthStart, monthEnd) } 
      }),
      this.insuranceRepo.count({ 
        where: { status: 'active' } 
      }),
      this.getExpiringCount(30),
      this.getExpiredCount(),
      this.carRepo.count({ 
        where: { secondPlateNumber: Not(IsNull()) } 
      }),
      this.carRepo.count({ 
        where: [
          { techPhoto: Not(IsNull()) },
          { carPhoto: Not(IsNull()) }
        ] 
      }),
      this.carRepo.count({ 
        where: { guarantorName: Not(IsNull()) } 
      }),
      this.carRepo.count({ 
        where: { secondPhone: Not(IsNull()) }
      }),
      this.carRepo.count({ 
        where: { moderationStatus: 'pending' } 
      }),
      this.carRepo.count({ 
        where: { moderationStatus: 'approved' } 
      }),
      this.carRepo.count({ 
        where: { moderationStatus: 'rejected' } 
      })
    ]);
    
    return {
      total,
      today: todayCount,
      month: monthCount,
      active: activeCount,
      expiring: expiringCount,
      expired: expiredCount,
      withSecondPlate,
      withPhotos,
      withGuarantor,
      withSecondPhone,
      moderation: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      }
    };
  }

  /**
   * Foydalanuvchi statistikasi
   */
  async getUserStats(userId: number): Promise<any> {
    const [total, today, month, pending, approved, rejected] = await Promise.all([
      this.carRepo.count({ where: { createdById: userId } }),
      this.getUserTodayCount(userId),
      this.getUserMonthCount(userId),
      this.carRepo.count({ where: { createdById: userId, moderationStatus: 'pending' } }),
      this.carRepo.count({ where: { createdById: userId, moderationStatus: 'approved' } }),
      this.carRepo.count({ where: { createdById: userId, moderationStatus: 'rejected' } })
    ]);
    
    return { 
      total, 
      today, 
      month,
      moderation: {
        pending,
        approved,
        rejected
      }
    };
  }

  /**
   * Foydalanuvchining bugungi avtomobillari
   */
  async getUserTodayCount(userId: number): Promise<number> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.carRepo.count({
      where: {
        createdById: userId,
        createdAt: Between(today, tomorrow)
      }
    });
  }

  /**
   * Foydalanuvchining oylik avtomobillari
   */
  async getUserMonthCount(userId: number): Promise<number> {
    const monthStart = DateUtil.getMonthStart();
    const monthEnd = DateUtil.getMonthEnd();
    
    return this.carRepo.count({
      where: {
        createdById: userId,
        createdAt: Between(monthStart, monthEnd)
      }
    });
  }

  // ============== QIDIRUV METODLARI ==============

  /**
   * Avtomobil qidirish (raqam, telefon, ism bo'yicha)
   */
  async searchCars(query: string): Promise<Car[]> {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const searchTerm = `%${query.trim()}%`;
    
    return this.carRepo
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.insurances', 'insurance')
      .leftJoinAndSelect('car.createdBy', 'user')
      .leftJoinAndSelect('car.submittedBy', 'submittedBy')
      .leftJoinAndSelect('car.moderatedBy', 'moderatedBy')
      .where('car.plateNumber ILIKE :term', { term: searchTerm })
      .orWhere('car.secondPlateNumber ILIKE :term', { term: searchTerm })
      .orWhere('car.ownerPhone ILIKE :term', { term: searchTerm })
      .orWhere('car.secondPhone ILIKE :term', { term: searchTerm })
      .orWhere('car.ownerName ILIKE :term', { term: searchTerm })
      .orWhere('car.guarantorName ILIKE :term', { term: searchTerm })
      .orWhere('car.guarantorPhone ILIKE :term', { term: searchTerm })
      .orderBy('car.createdAt', 'DESC')
      .take(20)
      .getMany();
  }

  /**
   * Telefon raqam bo'yicha qidirish (asosiy, ikkinchi yoki kafil)
   */
  async searchByPhone(phone: string): Promise<Car[]> {
    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
    
    return this.carRepo.find({
      where: [
        { ownerPhone: formattedPhone },
        { secondPhone: formattedPhone },
        { guarantorPhone: formattedPhone }
      ],
      relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Kafil bo'yicha qidirish (ism yoki telefon)
   */
  async searchByGuarantor(query: string): Promise<Car[]> {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const searchTerm = `%${query.trim()}%`;
    
    return this.carRepo
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.insurances', 'insurance')
      .leftJoinAndSelect('car.createdBy', 'user')
      .leftJoinAndSelect('car.submittedBy', 'submittedBy')
      .leftJoinAndSelect('car.moderatedBy', 'moderatedBy')
      .where('car.guarantorName ILIKE :term', { term: searchTerm })
      .orWhere('car.guarantorPhone ILIKE :term', { term: searchTerm })
      .orderBy('car.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Ikkinchi raqam bo'yicha qidirish
   */
  async searchBySecondPlate(query: string): Promise<Car[]> {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const searchTerm = `%${query.trim()}%`;
    
    return this.carRepo
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.insurances', 'insurance')
      .leftJoinAndSelect('car.createdBy', 'user')
      .leftJoinAndSelect('car.submittedBy', 'submittedBy')
      .leftJoinAndSelect('car.moderatedBy', 'moderatedBy')
      .where('car.secondPlateNumber ILIKE :term', { term: searchTerm })
      .orderBy('car.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Ikkinchi telefon bo'yicha qidirish
   */
  async searchBySecondPhone(phone: string): Promise<Car[]> {
    if (!phone) return [];
    
    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
    
    return this.carRepo.find({
      where: { secondPhone: formattedPhone },
      relations: ['insurances', 'createdBy', 'submittedBy', 'moderatedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Moderatsiya holati bo'yicha qidirish
   */
  async searchByModerationStatus(status: 'pending' | 'approved' | 'rejected'): Promise<Car[]> {
    return this.carRepo.find({
      where: { moderationStatus: status },
      relations: ['insurances', 'submittedBy', 'moderatedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  // ============== HISOBOT METODLARI ==============

  /**
   * Operator uchun avtomobil hisoboti
   */
  async getOperatorCarReport(userId: number, startDate: Date, endDate: Date): Promise<any> {
    const cars = await this.carRepo.find({
      where: {
        createdById: userId,
        createdAt: Between(startDate, endDate)
      },
      relations: ['insurances']
    });
    
    return {
      total: cars.length,
      withInsurance: cars.filter(c => c.insurances?.some(i => i.status === 'active')).length,
      withoutInsurance: cars.filter(c => !c.insurances?.some(i => i.status === 'active')).length,
      withGuarantor: cars.filter(c => c.guarantorName).length,
      withSecondPlate: cars.filter(c => c.secondPlateNumber).length,
      withSecondPhone: cars.filter(c => c.secondPhone).length,
      withPhotos: cars.filter(c => c.techPhoto && c.carPhoto).length,
      cars: cars.slice(0, 5).map(c => ({
        id: c.id,
        plateNumber: c.plateNumber,
        secondPlateNumber: c.secondPlateNumber,
        ownerName: c.ownerName,
        ownerPhone: c.ownerPhone,
        secondPhone: c.secondPhone,
        guarantorName: c.guarantorName,
        hasPhotos: !!(c.techPhoto && c.carPhoto)
      }))
    };
  }

  /**
   * Kunlik hisobot
   */
  async getDailyReport(date: Date = new Date()): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const cars = await this.carRepo.find({
      where: { createdAt: Between(startOfDay, endOfDay) },
      relations: ['createdBy', 'submittedBy']
    });
    
    const byUser = {};
    cars.forEach(car => {
      const userId = car.createdById;
      if (!byUser[userId]) {
        byUser[userId] = {
          userId,
          userName: car.createdBy?.firstName || 'Noma\'lum',
          count: 0,
          withGuarantor: 0,
          withSecondPlate: 0,
          withSecondPhone: 0,
          withPhotos: 0,
          cars: []
        };
      }
      byUser[userId].count++;
      if (car.guarantorName) byUser[userId].withGuarantor++;
      if (car.secondPlateNumber) byUser[userId].withSecondPlate++;
      if (car.secondPhone) byUser[userId].withSecondPhone++;
      if (car.techPhoto && car.carPhoto) byUser[userId].withPhotos++;
      
      byUser[userId].cars.push({
        plateNumber: car.plateNumber,
        secondPlateNumber: car.secondPlateNumber,
        ownerName: car.ownerName,
        ownerPhone: car.ownerPhone,
        secondPhone: car.secondPhone,
        guarantorName: car.guarantorName,
        hasPhotos: !!(car.techPhoto && car.carPhoto)
      });
    });
    
    return {
      date: startOfDay.toLocaleDateString('uz-UZ'),
      total: cars.length,
      withGuarantor: cars.filter(c => c.guarantorName).length,
      withSecondPlate: cars.filter(c => c.secondPlateNumber).length,
      withSecondPhone: cars.filter(c => c.secondPhone).length,
      withPhotos: cars.filter(c => c.techPhoto && c.carPhoto).length,
      byUser: Object.values(byUser)
    };
  }

  /**
   * Kafil statistikasi
   */
  async getGuarantorStats(): Promise<any> {
    const cars = await this.carRepo.find({
      where: { guarantorName: Not(IsNull()) },
      relations: ['insurances']
    });
    
    const stats = {
      total: cars.length,
      withActiveInsurance: cars.filter(c => c.insurances?.some(i => i.status === 'active')).length,
      byGuarantor: {}
    };
    
    cars.forEach(car => {
      const guarantorName = car.guarantorName || 'Noma\'lum';
      if (!stats.byGuarantor[guarantorName]) {
        stats.byGuarantor[guarantorName] = {
          count: 0,
          cars: []
        };
      }
      stats.byGuarantor[guarantorName].count++;
      stats.byGuarantor[guarantorName].cars.push({
        plateNumber: car.plateNumber,
        secondPlateNumber: car.secondPlateNumber,
        ownerPhone: car.ownerPhone,
        secondPhone: car.secondPhone
      });
    });
    
    return stats;
  }

  /**
   * Moderatsiya hisoboti
   */
  async getModerationReport(startDate: Date, endDate: Date): Promise<any> {
    const cars = await this.carRepo.find({
      where: {
        createdAt: Between(startDate, endDate)
      },
      relations: ['submittedBy', 'moderatedBy']
    });

    return {
      period: {
        start: startDate.toLocaleDateString('uz-UZ'),
        end: endDate.toLocaleDateString('uz-UZ')
      },
      total: cars.length,
      pending: cars.filter(c => c.moderationStatus === 'pending').length,
      approved: cars.filter(c => c.moderationStatus === 'approved').length,
      rejected: cars.filter(c => c.moderationStatus === 'rejected').length,
      byRegistrar: this.groupByRegistrar(cars),
      byOperator: this.groupByOperator(cars)
    };
  }

  private groupByRegistrar(cars: Car[]): any {
    const result = {};
    cars.forEach(car => {
      if (car.submittedBy) {
        const id = car.submittedById;
        if (!result[id]) {
          result[id] = {
            name: car.submittedBy.firstName || car.submittedBy.username,
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0
          };
        }
        result[id].total++;
        result[id][car.moderationStatus]++;
      }
    });
    return result;
  }

  private groupByOperator(cars: Car[]): any {
    const result = {};
    cars.forEach(car => {
      if (car.moderatedBy) {
        const id = car.moderatedById;
        if (!result[id]) {
          result[id] = {
            name: car.moderatedBy.firstName || car.moderatedBy.username,
            approved: 0,
            rejected: 0
          };
        }
        result[id][car.moderationStatus]++;
      }
    });
    return result;
  }

  // ============== VALIDATSIYA METODLARI ==============

  /**
   * Avtomobil raqami noyobligini tekshirish (asosiy raqam)
   */
  async isPlateNumberUnique(plateNumber: string, excludeId?: number): Promise<boolean> {
    const query = this.carRepo.createQueryBuilder('car')
      .where('car.plateNumber = :plateNumber', { plateNumber });
    
    if (excludeId) {
      query.andWhere('car.id != :excludeId', { excludeId });
    }
    
    const count = await query.getCount();
    return count === 0;
  }

  /**
   * Ikkinchi raqam noyobligini tekshirish
   */
  async isSecondPlateNumberUnique(secondPlateNumber: string, excludeId?: number): Promise<boolean> {
    if (!secondPlateNumber) return true;
    
    const query = this.carRepo.createQueryBuilder('car')
      .where('car.secondPlateNumber = :secondPlateNumber', { secondPlateNumber });
    
    if (excludeId) {
      query.andWhere('car.id != :excludeId', { excludeId });
    }
    
    const count = await query.getCount();
    return count === 0;
  }

  /**
   * Telefon raqami noyobligini tekshirish (asosiy telefon)
   */
  async isPhoneNumberUnique(phoneNumber: string, excludeId?: number): Promise<boolean> {
    const query = this.carRepo.createQueryBuilder('car')
      .where('car.ownerPhone = :phoneNumber', { phoneNumber });
    
    if (excludeId) {
      query.andWhere('car.id != :excludeId', { excludeId });
    }
    
    const count = await query.getCount();
    return count === 0;
  }

  /**
   * Ikkinchi telefon raqami noyobligini tekshirish
   */
  async isSecondPhoneUnique(phoneNumber: string, excludeId?: number): Promise<boolean> {
    if (!phoneNumber) return true;
    
    const query = this.carRepo.createQueryBuilder('car')
      .where('car.secondPhone = :phoneNumber', { phoneNumber });
    
    if (excludeId) {
      query.andWhere('car.id != :excludeId', { excludeId });
    }
    
    const count = await query.getCount();
    return count === 0;
  }

  /**
   * Kafil telefon raqami noyobligini tekshirish
   */
  async isGuarantorPhoneUnique(phoneNumber: string, excludeId?: number): Promise<boolean> {
    const query = this.carRepo.createQueryBuilder('car')
      .where('car.guarantorPhone = :phoneNumber', { phoneNumber });
    
    if (excludeId) {
      query.andWhere('car.id != :excludeId', { excludeId });
    }
    
    const count = await query.getCount();
    return count === 0;
  }

  /**
   * Avtomobil mavjudligini tekshirish
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.carRepo.count({ where: { id } });
    return count > 0;
  }

  // ============== RASM TEKSHIRISH METODLARI ==============

  /**
   * Avtomobil rasmlarini tekshirish
   */
  async checkCarPhotos(carId: number) {
    const car = await this.findOne(carId);
    
    if (!car) {
      console.log('❌ Avtomobil topilmadi');
      return null;
    }
    
    console.log('🚗 Avtomobil:', car.plateNumber);
    console.log('📸 Tex pasport:', car.techPhoto);
    console.log('📸 Mashina rasmi:', car.carPhoto);
    
    const result = {
      plateNumber: car.plateNumber,
      techPhoto: car.techPhoto,
      carPhoto: car.carPhoto,
      techPhotoExists: false,
      carPhotoExists: false,
      techFullPath: null,
      carFullPath: null
    };
    
    const fs = require('fs');
    const path = require('path');
    
    if (car.techPhoto) {
      const cleanPath = car.techPhoto.startsWith('/') 
        ? car.techPhoto.substring(1) 
        : car.techPhoto;
      
      const fullPath = path.join(process.cwd(), cleanPath);
      result.techFullPath = fullPath;
      result.techPhotoExists = fs.existsSync(fullPath);
      
      console.log('📁 Tex rasm to\'liq yo\'li:', fullPath);
      console.log('📁 Tex rasm mavjudmi?', result.techPhotoExists);
    }
    
    if (car.carPhoto) {
      const cleanPath = car.carPhoto.startsWith('/') 
        ? car.carPhoto.substring(1) 
        : car.carPhoto;
      
      const fullPath = path.join(process.cwd(), cleanPath);
      result.carFullPath = fullPath;
      result.carPhotoExists = fs.existsSync(fullPath);
      
      console.log('📁 Mashina rasm to\'liq yo\'li:', fullPath);
      console.log('📁 Mashina rasm mavjudmi?', result.carPhotoExists);
    }
    
    return result;
  }

  /**
   * Barcha avtomobillar rasmlarini tekshirish
   */
  async checkAllCarsPhotos(limit: number = 10) {
    const cars = await this.carRepo.find({
      take: limit,
      order: { createdAt: 'DESC' }
    });
    
    const results = [];
    for (const car of cars) {
      const result = await this.checkCarPhotos(car.id);
      results.push(result);
    }
    
    return results;
  }
}
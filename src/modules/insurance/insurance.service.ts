import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { Car } from '../../database/entities/car.entity';
import { DateUtil } from '../../common/utils/date.util';

@Injectable()
export class InsuranceService {
  constructor(
    @InjectRepository(CarInsurance) private insuranceRepo: Repository<CarInsurance>,
    @InjectRepository(Car) private carRepo: Repository<Car>,
  ) {}

  // ============== MAVJUD METODLAR ==============
  async findAll(): Promise<CarInsurance[]> {
    return this.insuranceRepo.find({
      relations: ['car', 'createdBy'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 🔥 YANGI: Barcha sug'urtalarni detallari bilan olish (hisobot uchun)
   */
  async findAllWithDetails(): Promise<CarInsurance[]> {
    return this.insuranceRepo.find({
      relations: ['car', 'createdBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<CarInsurance> {
    return this.insuranceRepo.findOne({
      where: { id },
      relations: ['car', 'createdBy', 'leads']
    });
  }

  async findByCar(carId: number): Promise<CarInsurance[]> {
    return this.insuranceRepo.find({
      where: { carId },
      relations: ['car'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 🔥 YANGI: Sug'urta turi bo'yicha qidirish
   */
  async findByType(type: string): Promise<CarInsurance[]> {
    return this.insuranceRepo.find({
      where: { type },
      relations: ['car', 'createdBy'],
      order: { createdAt: 'DESC' }
    });
  }

  //! ============== AKTIV SUG'URTALAR ==============
  async getActive(): Promise<CarInsurance[]> {
    return this.insuranceRepo.find({
      where: { status: 'active' },
      relations: ['car'],
      order: { endDate: 'ASC' }
    });
  }

  //! ============== MUDDATI TUGAYDIGAN SUG'URTALAR ==============
  async getExpiring(days: number): Promise<CarInsurance[]> {
    const targetDate = DateUtil.getDateRange(days);
    
    return this.insuranceRepo.find({
      where: {
        endDate: LessThan(targetDate),
        status: 'active'
      },
      relations: ['car'],
      order: { endDate: 'ASC' }
    });
  }

  //! ============== MUDDATI O'TGAN SUG'URTALAR ==============
  async getExpired(): Promise<CarInsurance[]> {
    const today = new Date();
    
    return this.insuranceRepo.find({
      where: {
        endDate: LessThan(today),
        status: 'active'
      },
      relations: ['car'],
      order: { endDate: 'DESC' }
    });
  }

  //! ============== YANGILANGAN SUG'URTALAR ==============
  async getRenewed(): Promise<CarInsurance[]> {
    return this.insuranceRepo.find({
      where: { status: 'renewed' },
      relations: ['car'],
      order: { updatedAt: 'DESC' }
    });
  }

  //! ============== AVTOMOBIL BO'YICHA AKTIV SUG'URTA ==============
  async getActiveByCar(carId: number): Promise<CarInsurance | null> {
    return this.insuranceRepo.findOne({
      where: { 
        carId, 
        status: 'active' 
      },
      relations: ['car']
    });
  }

  //! ============== SUG'URTA STATISTIKASI (YANGILANGAN) ==============
  async getStats(): Promise<any> {
    const today = new Date();
    const monthStart = DateUtil.getMonthStart();
    const monthEnd = DateUtil.getMonthEnd();
    const next30Days = DateUtil.getDateRange(30);
    
    const [
      active, 
      expiring, 
      expired, 
      renewed, 
      monthly, 
      total,
      byType
    ] = await Promise.all([
      this.insuranceRepo.count({ where: { status: 'active' } }),
      this.insuranceRepo.count({ 
        where: { 
          endDate: LessThan(next30Days),
          status: 'active' 
        } 
      }),
      this.insuranceRepo.count({ 
        where: { 
          endDate: LessThan(today), 
          status: 'active' 
        } 
      }),
      this.insuranceRepo.count({ where: { status: 'renewed' } }),
      this.insuranceRepo.count({ 
        where: { createdAt: Between(monthStart, monthEnd) } 
      }),
      this.insuranceRepo.count(),
      this.getStatsByType()
    ]);

    return {
      active,
      expiring,
      expired,
      renewed,
      monthly,
      total,
      byType
    };
  }

  /**
   * 🔥 YANGI: Turlar bo'yicha statistika
   */
  async getStatsByType(): Promise<any> {
    const types = ['24days', '6months', '1year', 'custom'];
    const result = {};

    for (const type of types) {
      const count = await this.insuranceRepo.count({
        where: { 
          type,
          status: 'active'
        }
      });
      result[type] = count;
    }

    // Qo'shimcha: eski insuranceType bo'yicha ham
    const standard = await this.insuranceRepo.count({
      where: { 
        insuranceType: 'standard',
        status: 'active'
      }
    });
    
    return {
      ...result,
      standard
    };
  }

  //! ============== SUG'URTA STATUSINI YANGILASH ==============
  async updateStatus(id: number, status: string): Promise<CarInsurance> {
    await this.insuranceRepo.update(id, { status });
    return this.findOne(id);
  }

  //! ============== BUGUNGI SUG'URTALAR ==============
  async getTodayCount(): Promise<number> {
    const today = DateUtil.getToday();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.insuranceRepo.count({
      where: { createdAt: Between(today, tomorrow) }
    });
  }

  //! ============== OYLIK SUG'URTALAR ==============
  async getMonthCount(): Promise<number> {
    const monthStart = DateUtil.getMonthStart();
    const monthEnd = DateUtil.getMonthEnd();
    
    return this.insuranceRepo.count({
      where: { createdAt: Between(monthStart, monthEnd) }
    });
  }

  /**
   * 🔥 YANGI: Sug'urta yaratish
   */
  async create(data: Partial<CarInsurance>): Promise<CarInsurance> {
    const insurance = this.insuranceRepo.create(data);
    return this.insuranceRepo.save(insurance);
  }

  /**
   * 🔥 YANGI: Sug'urta yangilash
   */
  async update(id: number, data: Partial<CarInsurance>): Promise<CarInsurance> {
    await this.insuranceRepo.update(id, data);
    return this.findOne(id);
  }

  /**
   * 🔥 YANGI: Sug'urtani o'chirish (soft delete)
   */
  async delete(id: number): Promise<void> {
    await this.insuranceRepo.update(id, { status: 'cancelled' });
  }

  /**
   * 🔥 YANGI: Avtomobilning aktiv sug'urtasini olish
   */
  async getCarActiveInsurance(carId: number): Promise<CarInsurance | null> {
    return this.insuranceRepo.findOne({
      where: { 
        carId, 
        status: 'active' 
      },
      relations: ['car']
    });
  }

  /**
   * 🔥 YANGI: Sug'urta muddati tugashiga qarab qidirish
   */
  async findByDaysLeft(days: number): Promise<CarInsurance[]> {
    const targetDate = DateUtil.getDateRange(days);
    const today = DateUtil.getToday();

    return this.insuranceRepo
      .createQueryBuilder('insurance')
      .leftJoinAndSelect('insurance.car', 'car')
      .where('insurance.endDate BETWEEN :today AND :targetDate', {
        today,
        targetDate
      })
      .andWhere('insurance.status = :status', { status: 'active' })
      .orderBy('insurance.endDate', 'ASC')
      .getMany();
  }

  /**
   * 🔥 YANGI: Eski sug'urtalarni tozalash
   */
  async cleanOldInsurances(days: number = 365): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await this.insuranceRepo
      .createQueryBuilder()
      .update()
      .set({ status: 'expired' })
      .where('endDate < :date', { date })
      .andWhere('status = :status', { status: 'active' })
      .execute();

    return result.affected || 0;
  }

  /**
   * 🔥 YANGI: Avtomobil va sug'urta ma'lumotlarini birgalikda olish
   */
  async getCarsWithInsurance(): Promise<any[]> {
    const cars = await this.carRepo.find({
      relations: ['insurances'],
      order: { createdAt: 'DESC' }
    });

    return cars.map(car => {
      const activeInsurance = car.insurances?.find(i => i.status === 'active');
      return {
        ...car,
        activeInsurance,
        hasActiveInsurance: !!activeInsurance,
        insuranceEndDate: activeInsurance?.endDate,
        daysLeft: activeInsurance ? DateUtil.daysRemaining(activeInsurance.endDate) : 0
      };
    });
  }

  /**
   * 🔥 YANGI: Sug'urta muddati bo'yicha statistika
   */
  async getExpirationStats(): Promise<any> {
    const today = new Date();
    const next7Days = DateUtil.getDateRange(7);
    const next30Days = DateUtil.getDateRange(30);
    const next90Days = DateUtil.getDateRange(90);

    const [
      expired,
      expiring7Days,
      expiring30Days,
      expiring90Days,
      active
    ] = await Promise.all([
      this.insuranceRepo.count({ 
        where: { 
          endDate: LessThan(today),
          status: 'active'
        } 
      }),
      this.insuranceRepo.count({ 
        where: { 
          endDate: Between(today, next7Days),
          status: 'active'
        } 
      }),
      this.insuranceRepo.count({ 
        where: { 
          endDate: Between(today, next30Days),
          status: 'active'
        } 
      }),
      this.insuranceRepo.count({ 
        where: { 
          endDate: Between(today, next90Days),
          status: 'active'
        } 
      }),
      this.insuranceRepo.count({ where: { status: 'active' } })
    ]);

    return {
      active,
      expired,
      expiring: {
        '7days': expiring7Days,
        '30days': expiring30Days,
        '90days': expiring90Days
      }
    };
  }
}
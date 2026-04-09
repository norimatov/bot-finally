import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { User } from '../../database/entities/user.entity';
import { Lead } from '../../database/entities/lead.entity';
import { DateUtil } from '../../common/utils/date.util';
import { KPI } from '../../common/constants/kpi.constants';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(CarInsurance) private insuranceRepo: Repository<CarInsurance>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Lead) private leadRepo: Repository<Lead>,
  ) {}

  async checkExpiringInsurances(): Promise<void> {
    const insurances = await this.insuranceRepo.find({
      where: { status: 'active' },
      relations: ['car']
    });

    for (const insurance of insurances) {
      const daysLeft = DateUtil.daysRemaining(insurance.endDate);
      
      // notificationDays [10, 5, 1] array ichida borligini tekshirish
      if (KPI.notificationDays.includes(daysLeft as any)) {
        await this.createNotificationsForInsurance(insurance, daysLeft);
      }
    }
  }

  private async createNotificationsForInsurance(insurance: CarInsurance, daysLeft: number): Promise<void> {
    const operators = await this.userRepo.find({
      where: { 
        role: 'operator', 
        isActive: true 
      }
    });

    let leadType: 'HOT' | 'WARM' | 'COLD' = 'COLD';
    if (daysLeft <= KPI.leadTypes.hot.days) leadType = 'HOT';
    else if (daysLeft <= KPI.leadTypes.warm.days) leadType = 'WARM';

    for (const operator of operators) {
      const existingLead = await this.leadRepo.findOne({
        where: {
          insuranceId: insurance.id,
          operatorId: operator.id,
          status: 'new'
        }
      });

      if (!existingLead) {
        const lead = new Lead();
        lead.carId = insurance.carId;
        lead.insuranceId = insurance.id;
        lead.operatorId = operator.id;
        lead.leadType = leadType;
        lead.daysRemaining = daysLeft;
        lead.status = 'new';
        await this.leadRepo.save(lead);

        await this.createNotification(
          operator.id,
          `⚠️ ${leadType} lead: ${insurance.car?.plateNumber}\nSug'urta muddati: ${daysLeft} kun`,
          'newLead'
        );
      }
    }
  }

  async createNotification(userId: number, message: string, type: string): Promise<Notification> {
    const notification = new Notification();
    notification.userId = userId;
    notification.message = message;
    notification.type = type;
    notification.isRead = false;
    
    return this.notifRepo.save(notification);
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notifRepo.find({
      where: { userId, isRead: false },
      order: { sentAt: 'DESC' }
    });
  }

  async markAsRead(id: number): Promise<void> {
    await this.notifRepo.update(id, { isRead: true });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
  }

  async deleteOldNotifications(days: number = 30): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await this.notifRepo.delete({
      sentAt: LessThan(date),
      isRead: true
    });

    return result.affected || 0;
  }
}
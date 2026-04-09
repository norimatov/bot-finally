import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Car } from './car.entity';
import { CarInsurance } from './insurance.entity';
import { User } from './user.entity';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Car)
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @Column({ 
    name: 'car_id',
    type: 'int'
  })
  carId: number;

  @ManyToOne(() => CarInsurance)
  @JoinColumn({ name: 'insurance_id' })
  insurance: CarInsurance;

  @Column({ 
    name: 'insurance_id',
    type: 'int'
  })
  insuranceId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @Column({ 
    name: 'operator_id', 
    nullable: true,
    type: 'int'
  })
  operatorId: number;

  // 🔥 LEAD TURI (ASOSIY MAYDON)
  @Column({ 
    name: 'lead_type', 
    type: 'enum', 
    enum: ['HOT', 'WARM', 'COLD'],
    enumName: 'lead_type_enum'
  })
  leadType: string;

  /**
   * 🔥 BACKWARD COMPATIBILITY UCHUN
   * Eski kodlarda lead.type ishlatilgan bo'lsa, bu maydon ishlaydi
   */
  @Column({ 
    name: 'type', 
    type: 'varchar',
    length: 10,
    nullable: true
  })
  type: string;

  @Column({ 
    name: 'status',
    type: 'enum', 
    enum: ['new', 'inProgress', 'closed', 'postponed', 'rejected'],
    default: 'new',
    enumName: 'lead_status_enum'
  })
  status: string;

  @Column({ 
    name: 'days_remaining', 
    nullable: true,
    type: 'int'
  })
  daysRemaining: number;

  // 📞 QO'NG'IROQ UCHUN MAYDONLAR
  @Column({ 
    name: 'last_call_at', 
    nullable: true,
    type: 'timestamp'
  })
  lastCallAt: Date;  // Oxirgi qo'ng'iroq vaqti

  @Column({ 
    name: 'call_count', 
    default: 0,
    type: 'int'
  })
  callCount: number;  // Qo'ng'iroqlar soni

  @Column({ 
    name: 'call_duration', 
    nullable: true,
    type: 'int'
  })
  callDuration: number;  // Qo'ng'iroq davomiyligi (sekund)

  @Column({ 
    name: 'call_result', 
    nullable: true,
    type: 'varchar',
    length: 50
  })
  callResult: string;  // Qo'ng'iroq natijasi

  // ⏰ ESLATMA UCHUN MAYDONLAR
  @Column({ 
    name: 'remind_at', 
    nullable: true,
    type: 'timestamp'
  })
  remindAt: Date;  // Eslatma vaqti

  @Column({ 
    name: 'remind_note', 
    nullable: true,
    type: 'text'
  })
  remindNote: string;  // Eslatma matni

  @Column({ 
    name: 'reminded', 
    default: false,
    type: 'boolean'
  })
  reminded: boolean;  // Eslatma yuborilganmi?

  // 📝 QO'SHIMCHA MA'LUMOTLAR
  @Column({ 
    name: 'customer_comment', 
    nullable: true,
    type: 'text'
  })
  customerComment: string;  // Mijoz izohi

  @Column({ 
    name: 'next_action', 
    nullable: true,
    type: 'varchar',
    length: 100
  })
  nextAction: string;  // Keyingi harakat

  @Column({ 
    name: 'next_action_date', 
    nullable: true,
    type: 'timestamp'
  })
  nextActionDate: Date;  // Keyingi harakat sanasi

  // 📊 STATISTIKA UCHUN
  @Column({ 
    name: 'response_time', 
    nullable: true,
    type: 'int'
  })
  responseTime: number;  // Javob berish vaqti (daqiqa)

  @Column({ 
    name: 'follow_up_count', 
    default: 0,
    type: 'int'
  })
  followUpCount: number;  // Takroriy qo'ng'iroqlar soni

  @Column({ 
    name: 'last_follow_up', 
    nullable: true,
    type: 'timestamp'
  })
  lastFollowUp: Date;  // Oxirgi takroriy qo'ng'iroq

  // MAVJUD MAYDONLAR
  @Column({ 
    type: 'text', 
    nullable: true 
  })
  notes: string;

  @Column({ 
    name: 'closed_at', 
    nullable: true,
    type: 'timestamp'
  })
  closedAt: Date;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp'
  })
  createdAt: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp'
  })
  updatedAt: Date;
}
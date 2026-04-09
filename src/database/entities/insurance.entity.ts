import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Car } from './car.entity';
import { User } from './user.entity';
import { Lead } from './lead.entity';

@Entity('insurances')
export class CarInsurance {
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

  @Column({ 
    name: 'policy_number', 
    nullable: true, 
    unique: true,
    type: 'varchar',
    length: 50
  })
  policyNumber: string;

  @Column({ 
    name: 'start_date', 
    type: 'date' 
  })
  startDate: Date;

  @Column({ 
    name: 'end_date', 
    type: 'date' 
  })
  endDate: Date;

  /**
   * 🔥 YANGI: Sug'urta turi
   * add-car.scene.ts dagi '24days' | '6months' | '1year' qiymatlarini saqlaydi
   */
  @Column({ 
    name: 'type',
    type: 'enum',
    enum: ['24days', '6months', '1year', 'custom'],
    default: 'custom',
    enumName: 'insurance_type_enum'
  })
  type: string;

  // Eski insuranceType maydoni (backward compatibility uchun)
  @Column({ 
    name: 'insurance_type', 
    default: 'standard',
    type: 'varchar',
    length: 50
  })
  insuranceType: string;

  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    nullable: true 
  })
  amount: number;

  @Column({ 
    name: 'status',
    type: 'enum', 
    enum: ['active', 'expired', 'cancelled', 'renewed'],
    default: 'active',
    enumName: 'insurance_status_enum'
  })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ 
    name: 'created_by_id',
    type: 'int'
  })
  createdById: number;

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

  @OneToMany(() => Lead, lead => lead.insurance)
  leads: Lead[];
}
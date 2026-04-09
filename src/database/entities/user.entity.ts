// src/database/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Car } from './car.entity';
import { Kpi } from './kpi.entity';
import { Lead } from './lead.entity';
import { Notification } from './notification.entity';
import { DailyStat } from './daily-stat.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    name: 'telegram_id', 
    unique: true,
    type: 'varchar',  // ✅ 'bigint' -> 'varchar' ga o'zgartirildi
    length: 50
  })
  telegramId: string;  // ✅ 'bigint' -> 'string'

  @Column({ nullable: true })
  username: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ 
    type: 'enum', 
    enum: ['registrar', 'operator', 'admin'],
    default: 'registrar'
  })
  role: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Car, car => car.createdBy)
  cars: Car[];

  @OneToMany(() => Kpi, kpi => kpi.user)
  kpis: Kpi[];

  @OneToMany(() => Lead, lead => lead.operator)
  leads: Lead[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => DailyStat, dailyStat => dailyStat.user)
  dailyStats: DailyStat[];
}
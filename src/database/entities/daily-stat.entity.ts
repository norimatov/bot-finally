import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('daily_stats')
export class DailyStat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ 
    name: 'user_id',
    type: 'int'  // type qo'shildi
  })
  userId: number;

  @Column({ 
    type: 'date' 
  })
  date: Date;

  @Column({ 
    name: 'cars_added', 
    default: 0,
    type: 'int'  // type qo'shildi
  })
  carsAdded: number;

  @Column({ 
    name: 'leads_closed', 
    default: 0,
    type: 'int'  // type qo'shildi
  })
  leadsClosed: number;

  @Column({ 
    name: 'total_earned', 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0 
  })
  totalEarned: number;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp'  // type qo'shildi
  })
  createdAt: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp'  // type qo'shildi
  })
  updatedAt: Date;
}
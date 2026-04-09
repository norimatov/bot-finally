import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ 
    name: 'telegram_id', 
    nullable: true,
    type: 'bigint' 
  })
  telegramId: bigint;  

  @Column({ 
    type: 'enum', 
    enum: ['insuranceExpiring', 'insuranceExpired', 'newLead', 'leadClosed', 'kpiEarned', 'payment', 'system']
  })
  type: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;

  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt: Date;
}
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('kpis')
export class Kpi {
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
    name: 'action_type',
    type: 'varchar',  // type qo'shildi
    length: 50        // length qo'shildi
  })
  actionType: string;

  @Column({ 
    default: 0,
    type: 'int'  // type qo'shildi
  })
  points: number;

  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 0 
  })
  amount: number;

  @Column({ 
    name: 'reference_id', 
    nullable: true,
    type: 'int'  // type qo'shildi
  })
  referenceId: number;

  @Column({ 
    name: 'reference_type', 
    nullable: true,
    type: 'varchar',  // type qo'shildi
    length: 50        // length qo'shildi
  })
  referenceType: string;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp'  // type qo'shildi
  })
  createdAt: Date;
}
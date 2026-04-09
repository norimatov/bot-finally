import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('bot_sessions')
export class BotSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    name: 'telegram_id', 
    unique: true,
    type: 'bigint'  // type qo'shildi
  })
  telegramId: bigint;

  @Column({ 
    name: 'session_data', 
    type: 'jsonb', 
    nullable: true 
  })
  sessionData: any;

  @Column({ 
    name: 'current_scene', 
    nullable: true,
    type: 'varchar',  // type qo'shildi
    length: 100       // length qo'shildi
  })
  currentScene: string;

  @Column({ 
    name: 'temp_data', 
    type: 'jsonb', 
    nullable: true 
  })
  tempData: any;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp'  // type qo'shildi
  })
  updatedAt: Date;
}
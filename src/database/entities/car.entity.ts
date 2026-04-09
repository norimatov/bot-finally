import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { CarInsurance } from './insurance.entity';
import { Lead } from './lead.entity';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  // Asosiy avtomobil raqami
  @Column({
    name: 'plate_number',
    unique: true,
    type: 'varchar',
    length: 20
  })
  plateNumber: string;

  // Ikkinchi avtomobil raqami (agar kerak bo'lsa)
  @Column({
    name: 'second_plate_number',
    type: 'varchar',
    length: 20,
    nullable: true
  })
  secondPlateNumber: string;

  // Avtomobil egasining ismi
  @Column({
    name: 'owner_name',
    nullable: true,
    type: 'varchar',
    length: 100
  })
  ownerName: string;

  // Asosiy telefon raqam
  @Column({
    name: 'owner_phone',
    type: 'varchar',
    length: 20
  })
  ownerPhone: string;

  // IKKINCHI TELEFON RAQAMI
  @Column({
    name: 'second_phone',
    type: 'varchar',
    length: 20,
    nullable: true
  })
  secondPhone: string;

  // 🔥 TEX PASPORT OLD TOMONI
  @Column({
    name: 'tech_photo',
    type: 'text',
    nullable: true
  })
  techPhoto: string;

  // 🔥 YANGI: TEX PASPORT ORQA TOMONI (SERIYALI)
  @Column({
    name: 'tech_back_photo',
    type: 'text',
    nullable: true
  })
  techBackPhoto: string;

  // Mashina rasmi yo'li
  @Column({
    name: 'car_photo',
    type: 'text',
    nullable: true
  })
  carPhoto: string;

  // Kafil (zaxira) ismi
  @Column({
    name: 'guarantor_name',
    type: 'varchar',
    length: 100,
    nullable: true
  })
  guarantorName: string;

  // Kafil (zaxira) telefon raqami
  @Column({
    name: 'guarantor_phone',
    type: 'varchar',
    length: 20,
    nullable: true
  })
  guarantorPhone: string;

  // Avtomobil brandi
  @Column({
    nullable: true,
    type: 'varchar',
    length: 50
  })
  brand: string;

  // Avtomobil modeli
  @Column({
    nullable: true,
    type: 'varchar',
    length: 50
  })
  model: string;

  // Avtomobil yili
  @Column({
    nullable: true,
    type: 'int'
  })
  year: number;

  // 🔥 MODERATSIYA HOLATI
  @Column({
    name: 'moderation_status',
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  moderationStatus: string;

  // 🔥 MODERATOR (tasdiqlagan operator)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'moderated_by_id' })
  moderatedBy: User;

  @Column({
    name: 'moderated_by_id',
    type: 'int',
    nullable: true
  })
  moderatedById: number;

  // 🔥 MODERATSIYA VAQTI
  @Column({
    name: 'moderated_at',
    type: 'timestamp',
    nullable: true
  })
  moderatedAt: Date;

  // 🔥 RAD ETISH SABABI
  @Column({
    name: 'rejection_reason',
    type: 'text',
    nullable: true
  })
  rejectionReason: string;

  // 🔥 YUBORUVCHI (registrar)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitted_by_id' })
  submittedBy: User;

  @Column({
    name: 'submitted_by_id',
    type: 'int',
    nullable: true
  })
  submittedById: number;

  // Kim tomonidan qo'shilgan (eski maydon)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({
    name: 'created_by_id',
    type: 'int'
  })
  createdById: number;

  // Yaratilgan sana
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp'
  })
  createdAt: Date;

  // Yangilangan sana
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp'
  })
  updatedAt: Date;

  // Sug'urtalar bilan bog'lanish
  @OneToMany(() => CarInsurance, insurance => insurance.car)
  insurances: CarInsurance[];

  // Leadlar bilan bog'lanish
  @OneToMany(() => Lead, lead => lead.car)
  leads: Lead[];
}
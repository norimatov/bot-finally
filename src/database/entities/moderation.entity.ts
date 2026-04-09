import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Car } from './car.entity';

@Entity('moderations')
export class Moderation {
  @PrimaryGeneratedColumn()
  id: number;

  // Avtomobil bilan bog'lanish (agar avtomobil yaratilgan bo'lsa)
  @ManyToOne(() => Car, { nullable: true })
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @Column({
    name: 'car_id',
    type: 'int',
    nullable: true
  })
  carId: number;

  // Avtomobil raqami
  @Column({
    name: 'plate_number',
    type: 'varchar',
    length: 20
  })
  plateNumber: string;

  // Avtomobil egasi
  @Column({
    name: 'owner_name',
    type: 'varchar',
    length: 100
  })
  ownerName: string;

  // Asosiy telefon
  @Column({
    name: 'owner_phone',
    type: 'varchar',
    length: 20
  })
  ownerPhone: string;

  // Ikkinchi telefon (agar mavjud bo'lsa)
  @Column({
    name: 'second_phone',
    type: 'varchar',
    length: 20,
    nullable: true
  })
  secondPhone: string;

  // 🔥 Tex pasport old tomoni (file path yoki URL)
  @Column({
    name: 'tech_photo',
    type: 'text'
  })
  techPhoto: string;

  // 🔥 YANGI: Tex pasport orqa tomoni (seriyali)
  @Column({
    name: 'tech_back_photo',
    type: 'text',
    nullable: true
  })
  techBackPhoto: string;

  // Avtomobil rasmi (file path yoki URL)
  @Column({
    name: 'car_photo',
    type: 'text'
  })
  carPhoto: string;

  // 🔥 Sug'urta turi (24days, 6months, 1year, custom)
  @Column({
    name: 'insurance_type',
    type: 'varchar',
    length: 20
  })
  insuranceType: string;

  // Sug'urta boshlanish sanasi
  @Column({
    name: 'start_date',
    type: 'timestamp'
  })
  startDate: Date;

  // Sug'urta tugash sanasi
  @Column({
    name: 'end_date',
    type: 'timestamp'
  })
  endDate: Date;

  // Moderatsiya statusi
  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'pending'
  })
  status: 'pending' | 'approved' | 'rejected';

  // Registrator (ma'lumotni yuborgan foydalanuvchi)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitted_by_id' })
  submittedBy: User;

  @Column({
    name: 'submitted_by_id',
    type: 'int'
  })
  submittedById: number;

  // Registratorning Telegram ID si (tez murojaat uchun)
  @Column({
    name: 'registrar_telegram_id',
    type: 'varchar',
    length: 50,
    nullable: true
  })
  registrarTelegramId: string;

  // Registrator ismi (tez ko'rish uchun)
  @Column({
    name: 'registrar_name',
    type: 'varchar',
    length: 100,
    nullable: true
  })
  registrarName: string;

  // Moderator (tasdiqlagan yoki rad etgan foydalanuvchi)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderated_by_id' })
  moderatedBy: User;

  @Column({
    name: 'moderated_by_id',
    type: 'int',
    nullable: true
  })
  moderatedById: number;

  // Moderatsiya qilingan vaqt
  @Column({
    name: 'moderated_at',
    type: 'timestamp',
    nullable: true
  })
  moderatedAt: Date;

  // Rad etish sababi (matn)
  @Column({
    name: 'rejection_reason',
    type: 'text',
    nullable: true
  })
  rejectionReason: string;

  // Rad etish maydoni (plate, photo, document, car, other)
  @Column({
    name: 'rejection_field',
    type: 'varchar',
    length: 50,
    nullable: true
  })
  rejectionField: string;

  // Moderatsiya muddati (masalan, 48 soat)
  @Column({
    name: 'expires_at',
    type: 'timestamp'
  })
  expiresAt: Date;

  // Qaysi operatorlarga xabar yuborilgan (ID lar ro'yxati)
  @Column({
    name: 'notified_operators',
    type: 'simple-array',
    nullable: true
  })
  notifiedOperators: string[];

  // Qo'shimcha ma'lumotlar (JSON formatda)
  @Column({
    name: 'additional_data',
    type: 'json',
    nullable: true
  })
  additionalData: any;

  // Yaratilgan vaqt
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp'
  })
  createdAt: Date;
}
// src/modules/moderation/interfaces/moderation.interface.ts

/**
 * Moderatsiya uchun vaqtinchalik ma'lumotlar
 */
export interface ModerationData {
  plateNumber: string;
  ownerName: string;
  ownerPhone: string;
  secondPhone?: string | null;
  techPhoto: string;
  carPhoto: string;
  insuranceType: '24days' | '6months' | '1year';
  startDate: Date;
  endDate: Date;
  registrarId: number;
  registrarName: string;
  registrarTelegramId: string;
  submittedAt: Date;
}

/**
 * Moderatsiya natijasi
 */
export interface ModerationResult {
  id: string;
  data: ModerationData;
  status: 'pending' | 'approved' | 'rejected';
  notifiedOperators: number[];
  moderatedBy?: number;
  moderatedAt?: Date;
  rejectionReason?: RejectionReason;
  expiresAt: number;
}

/**
 * Rad etish sababi
 */
export interface RejectionReason {
  field?: string;      // Qaysi maydon xato (masalan: 'plateNumber', 'ownerName')
  message: string;     // Asosiy sabab
  details?: string;    // Qo'shimcha tafsilot
}

/**
 * Moderatsiya statistikasi (admin uchun)
 */
export interface ModerationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
}

/**
 * Operator statistikasi
 */
export interface OperatorModerationStats {
  operatorId: number;
  operatorName: string;
  approved: number;
  rejected: number;
  total: number;
}

/**
 * Registrator statistikasi
 */
export interface RegistrarModerationStats {
  registrarId: number;
  registrarName: string;
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}
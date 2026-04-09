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
export interface RejectionReason {
    field?: string;
    message: string;
    details?: string;
}
export interface ModerationStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
}
export interface OperatorModerationStats {
    operatorId: number;
    operatorName: string;
    approved: number;
    rejected: number;
    total: number;
}
export interface RegistrarModerationStats {
    registrarId: number;
    registrarName: string;
    pending: number;
    approved: number;
    rejected: number;
    total: number;
}

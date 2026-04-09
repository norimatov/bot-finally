import { Repository } from 'typeorm';
import { Car } from '../../database/entities/car.entity';
import { User } from '../../database/entities/user.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { BotService } from '../bot/bot.service';
export interface ModerationData {
    plateNumber: string;
    ownerName: string;
    ownerPhone: string;
    secondPhone?: string | null;
    techPhoto: string;
    techBackPhoto: string;
    carPhoto: string;
    insuranceType: '24days' | '6months' | '1year' | 'custom';
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
    rejectionReason?: {
        field?: string;
        message: string;
        details?: string;
    };
    expiresAt: number;
}
export interface RejectionReason {
    field?: string;
    message: string;
    details?: string;
}
export declare class ModerationService {
    private carRepo;
    private userRepo;
    private insuranceRepo;
    private botService;
    private readonly logger;
    private moderationStorage;
    private readonly EXPIRY_TIME;
    private readonly fieldNames;
    constructor(carRepo: Repository<Car>, userRepo: Repository<User>, insuranceRepo: Repository<CarInsurance>, botService: BotService);
    create(data: ModerationData): Promise<string>;
    notifyOperators(moderationId: string): Promise<void>;
    markNotified(moderationId: string, operatorId: number): Promise<void>;
    notifyApproval(moderationId: string, car: any): Promise<void>;
    notifyRejection(moderationId: string, reason: RejectionReason): Promise<void>;
    private autoReject;
    get(id: string): Promise<ModerationResult | null>;
    approve(id: string, operatorId: number): Promise<{
        success: boolean;
        car?: Car;
        message: string;
    }>;
    reject(id: string, operatorId: number, reason: RejectionReason): Promise<{
        success: boolean;
        message: string;
    }>;
    getPendingCount(): Promise<number>;
    getPending(): Promise<ModerationResult[]>;
    getOperatorModerations(operatorId: number): Promise<ModerationResult[]>;
    getOperatorStats(operatorId: number): Promise<any>;
    private remindOperators;
    private cleanExpired;
    private generateModerationId;
    private formatPhone;
    private getInsuranceTypeText;
    private calculateKPI;
}

import { ModerationService } from './moderation.service';
export declare class ModerationController {
    private moderationService;
    constructor(moderationService: ModerationService);
    getStats(): Promise<{
        success: boolean;
        data: {
            total: number;
            pending: number;
            approved: number;
            rejected: number;
            expired: number;
        };
    }>;
    private getAllModerationsFromStorage;
    getAll(): Promise<{
        success: boolean;
        data: {
            id: string;
            plateNumber: string;
            ownerName: string;
            ownerPhone: string;
            status: "rejected" | "pending" | "approved";
            submittedAt: Date;
            expiresAt: number;
            registrarName: string;
            moderatedBy: number;
            moderatedAt: Date;
            rejectionReason: {
                field?: string;
                message: string;
                details?: string;
            };
        }[];
    }>;
    getPending(): Promise<{
        success: boolean;
        data: {
            id: string;
            plateNumber: string;
            ownerName: string;
            ownerPhone: string;
            secondPhone: string;
            insuranceType: "24days" | "6months" | "1year" | "custom";
            startDate: Date;
            endDate: Date;
            submittedAt: Date;
            expiresAt: number;
            timeLeft: number;
            registrarName: string;
            hasTechPhoto: boolean;
            hasCarPhoto: boolean;
        }[];
    }>;
    getApproved(): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    getRejected(): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    getOperatorStats(operatorId: number): Promise<{
        success: boolean;
        data: any;
    }>;
    getRegistrarStats(registrarId: number): Promise<{
        success: boolean;
        data: {
            pending: number;
            approved: number;
            rejected: number;
            total: number;
            message: string;
        };
    }>;
    getOne(id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            data: import("./moderation.service").ModerationData;
            status: "rejected" | "pending" | "approved";
            notifiedOperators: number[];
            moderatedBy: number;
            moderatedAt: Date;
            rejectionReason: {
                field?: string;
                message: string;
                details?: string;
            };
            expiresAt: number;
            timeLeft: number;
        };
    }>;
    approve(id: string, operatorId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            carId: number;
            plateNumber: string;
        };
    }>;
    reject(id: string, operatorId: number, reason: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getPhotos(id: string): Promise<{
        success: boolean;
        data: {
            techPhoto: string;
            carPhoto: string;
        };
    }>;
    getOperatorModerations(operatorId: number): Promise<{
        success: boolean;
        data: {
            id: string;
            plateNumber: string;
            ownerName: string;
            status: "rejected" | "pending" | "approved";
            submittedAt: Date;
            expiresAt: number;
            timeLeft: number;
        }[];
    }>;
}

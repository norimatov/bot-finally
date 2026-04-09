import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Kpi } from '../../database/entities/kpi.entity';
import { ConfigService } from '../../config/config.service';
import { Telegraf } from 'telegraf';
export interface SendMessageOptions {
    reply_markup?: any;
    parse_mode?: 'HTML' | 'Markdown';
    disable_web_page_preview?: boolean;
    disable_notification?: boolean;
}
export declare class BotService {
    private readonly bot;
    private userRepo;
    private kpiRepo;
    private configService;
    constructor(bot: Telegraf, userRepo: Repository<User>, kpiRepo: Repository<Kpi>, configService: ConfigService);
    findOrCreateUser(telegramUser: any): Promise<User>;
    addKpi(userId: number, amount: number, action: string, referenceId?: number): Promise<Kpi>;
    updateUserRole(telegramId: string, newRole: string): Promise<User>;
    getAllUsers(): Promise<User[]>;
    deactivateUser(telegramId: string, deactivatedBy?: string): Promise<void>;
    activateUser(telegramId: string, activatedBy?: string): Promise<void>;
    getRules(): string;
    sendMessage(telegramId: string, message: string): Promise<boolean>;
    sendMessage(telegramId: string, message: string, keyboard: any): Promise<boolean>;
    sendInlineKeyboard(telegramId: string, message: string, inlineKeyboard: any[][]): Promise<boolean>;
    sendReplyKeyboard(telegramId: string, message: string, buttons: string[][], resizeKeyboard?: boolean): Promise<boolean>;
    sendHtmlMessage(telegramId: string, message: string): Promise<boolean>;
    private sendToAdmins;
    notifyAdminsAboutRoleChange(user: User, oldRole: string, newRole: string, changedBy: string): Promise<void>;
    notifyAdminsAboutUserStatus(user: User, isActive: boolean, changedBy: string): Promise<void>;
    notifyAboutNewCar(car: any, addedBy: User): Promise<void>;
    notifyAboutClosedLead(lead: any, closedBy: User, amount: number): Promise<void>;
    notifyAboutExpiringInsurance(car: any, daysLeft: number): Promise<void>;
    notifyAboutNewAdmin(user: User, addedBy: string): Promise<void>;
    notifyAboutNewOperator(user: User, addedBy: string): Promise<void>;
    notifyAboutNewRegistrar(user: User, addedBy: string): Promise<void>;
    private getRoleIcon;
}

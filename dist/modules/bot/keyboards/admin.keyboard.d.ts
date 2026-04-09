import { Markup } from 'telegraf';
export declare class AdminKeyboard {
    getAdminMainKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getStatsKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getUserManagementKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getLeadManagementKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getFinanceKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getReportsKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getSettingsKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getCarsKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getInsuranceKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getInsuranceTypeKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getPhotoTypeKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getDateKeyboard(days?: number): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getUserRoleKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getExportKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getPaymentConfirmKeyboard(paymentId: number): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getOperatorActionKeyboard(operatorId: number): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getLeadAssignKeyboard(leadId: number, operators: any[]): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getCarSearchKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getCarActionKeyboard(carId: number): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getInsuranceDurationKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
}

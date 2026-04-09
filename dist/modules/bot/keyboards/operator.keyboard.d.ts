import { Markup } from 'telegraf';
export declare class OperatorKeyboard {
    getOperatorMainKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getModerationKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getLeadsMenuKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getLeadStatusKeyboard(leadId: number): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getCallResultKeyboard(leadId: number): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getReminderTimeKeyboard(leadId: number): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getCustomerInfoKeyboard(leadId: number): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getDailyPlanKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getLeadFilterKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getPaginationKeyboard(currentPage: number, totalPages: number): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getContactKeyboard(phone: string, carPlate: string): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getAdditionalActionsKeyboard(leadId: number): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
    getStatsKeyboard(): Markup.Markup<import("@telegraf/types").InlineKeyboardMarkup>;
}

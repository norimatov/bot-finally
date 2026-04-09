import { Markup } from 'telegraf';
export declare class MainKeyboard {
    getMainKeyboard(role: string): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getAdminKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getOperatorKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getRegistrarKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getBackKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getCancelKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
    getPhoneKeyboard(): Markup.Markup<import("@telegraf/types").ReplyKeyboardMarkup>;
}

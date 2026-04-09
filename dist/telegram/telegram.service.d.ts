import { Context, Telegraf } from 'telegraf';
export declare class TelegramService {
    private bot;
    private readonly logger;
    constructor(bot: Telegraf<Context>);
    sendMessage(chatId: number, message: string, options?: any): Promise<void>;
    sendPhoto(chatId: number, photo: string, caption?: string): Promise<void>;
    sendDocument(chatId: number, document: any, filename?: string): Promise<void>;
    editMessageText(chatId: number, messageId: number, text: string): Promise<void>;
    answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void>;
    sendMediaGroup(chatId: number, media: any[]): Promise<void>;
    deleteMessage(chatId: number, messageId: number): Promise<void>;
}

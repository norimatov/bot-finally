"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const nestjs_telegraf_1 = require("nestjs-telegraf");
let TelegramService = TelegramService_1 = class TelegramService {
    constructor(bot) {
        this.bot = bot;
        this.logger = new common_1.Logger(TelegramService_1.name);
    }
    async sendMessage(chatId, message, options) {
        try {
            await this.bot.telegram.sendMessage(chatId, message, options);
        }
        catch (error) {
            this.logger.error(`Failed to send message to ${chatId}: ${error.message}`);
        }
    }
    async sendPhoto(chatId, photo, caption) {
        try {
            await this.bot.telegram.sendPhoto(chatId, photo, { caption });
        }
        catch (error) {
            this.logger.error(`Failed to send photo to ${chatId}: ${error.message}`);
        }
    }
    async sendDocument(chatId, document, filename) {
        try {
            await this.bot.telegram.sendDocument(chatId, document);
        }
        catch (error) {
            this.logger.error(`Failed to send document to ${chatId}: ${error.message}`);
        }
    }
    async editMessageText(chatId, messageId, text) {
        try {
            await this.bot.telegram.editMessageText(chatId, messageId, undefined, text);
        }
        catch (error) {
            this.logger.error(`Failed to edit message: ${error.message}`);
        }
    }
    async answerCallbackQuery(callbackQueryId, text) {
        try {
            await this.bot.telegram.answerCbQuery(callbackQueryId, text);
        }
        catch (error) {
            this.logger.error(`Failed to answer callback query: ${error.message}`);
        }
    }
    async sendMediaGroup(chatId, media) {
        try {
            await this.bot.telegram.sendMediaGroup(chatId, media);
        }
        catch (error) {
            this.logger.error(`Failed to send media group to ${chatId}: ${error.message}`);
        }
    }
    async deleteMessage(chatId, messageId) {
        try {
            await this.bot.telegram.deleteMessage(chatId, messageId);
        }
        catch (error) {
            this.logger.error(`Failed to delete message: ${error.message}`);
        }
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map
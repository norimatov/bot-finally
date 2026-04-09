import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(@InjectBot() private bot: Telegraf<Context>) {}

  async sendMessage(chatId: number, message: string, options?: any): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, message, options);
    } catch (error) {
      this.logger.error(`Failed to send message to ${chatId}: ${error.message}`);
    }
  }

  async sendPhoto(chatId: number, photo: string, caption?: string): Promise<void> {
    try {
      await this.bot.telegram.sendPhoto(chatId, photo, { caption });
    } catch (error) {
      this.logger.error(`Failed to send photo to ${chatId}: ${error.message}`);
    }
  }

  async sendDocument(chatId: number, document: any, filename?: string): Promise<void> {
    try {
      await this.bot.telegram.sendDocument(chatId, document);
    } catch (error) {
      this.logger.error(`Failed to send document to ${chatId}: ${error.message}`);
    }
  }

  async editMessageText(chatId: number, messageId: number, text: string): Promise<void> {
    try {
      await this.bot.telegram.editMessageText(chatId, messageId, undefined, text);
    } catch (error) {
      this.logger.error(`Failed to edit message: ${error.message}`);
    }
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    try {
      await this.bot.telegram.answerCbQuery(callbackQueryId, text);
    } catch (error) {
      this.logger.error(`Failed to answer callback query: ${error.message}`);
    }
  }

  async sendMediaGroup(chatId: number, media: any[]): Promise<void> {
    try {
      await this.bot.telegram.sendMediaGroup(chatId, media);
    } catch (error) {
      this.logger.error(`Failed to send media group to ${chatId}: ${error.message}`);
    }
  }

  async deleteMessage(chatId: number, messageId: number): Promise<void> {
    try {
      await this.bot.telegram.deleteMessage(chatId, messageId);
    } catch (error) {
      this.logger.error(`Failed to delete message: ${error.message}`);
    }
  }
}
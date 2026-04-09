
import { Injectable } from '@nestjs/common';
import { Telegraf, Context } from 'telegraf';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class TelegrafAdapter {
  private bot: Telegraf<Context>;

  constructor(private configService: ConfigService) {
    this.bot = new Telegraf<Context>(this.configService.botToken);
  }

  getBot(): Telegraf<Context> {
    return this.bot;
  }

  async launch(): Promise<void> {
    await this.bot.launch();
  }

  async stop(): Promise<void> {
    await this.bot.stop();
  }
}

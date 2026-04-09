import { Telegraf, Context } from 'telegraf';
import { ConfigService } from '../../config/config.service';
export declare class TelegrafAdapter {
    private configService;
    private bot;
    constructor(configService: ConfigService);
    getBot(): Telegraf<Context>;
    launch(): Promise<void>;
    stop(): Promise<void>;
}

import { NestMiddleware } from '@nestjs/common';
import { Context } from 'telegraf';
import { Repository } from 'typeorm';
import { BotSession } from '../../database/entities/bot-session.entity';
export interface SessionContext extends Context {
    session?: any;
    scene?: {
        current?: string;
        enter: (sceneName: string, initialState?: any) => Promise<void>;
        leave: () => Promise<void>;
        state?: any;
    };
}
export declare class SessionMiddleware implements NestMiddleware {
    private sessionRepo;
    constructor(sessionRepo: Repository<BotSession>);
    use(ctx: SessionContext, next: () => void): Promise<void>;
}

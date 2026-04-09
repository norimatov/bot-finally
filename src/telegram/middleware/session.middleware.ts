import { Injectable, NestMiddleware } from '@nestjs/common';
import { Context } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(BotSession)
    private sessionRepo: Repository<BotSession>,
  ) {}

  async use(ctx: SessionContext, next: () => void) {
    const telegramId = ctx.from?.id;
    
    if (telegramId) {
      try {
        let session = await this.sessionRepo.findOne({
          where: { telegramId: BigInt(telegramId) }
        });

        if (!session) {
          session = this.sessionRepo.create({
            telegramId: BigInt(telegramId),
            sessionData: {},
            tempData: {}
          });
          session = await this.sessionRepo.save(session);
        }

        ctx.session = session.sessionData || {};
        
        ctx.scene = {
          current: session.currentScene,
          enter: async (sceneName: string, initialState?: any) => {
            session.currentScene = sceneName;
            session.sessionData = { ...session.sessionData, ...initialState };
            await this.sessionRepo.save(session);
          },
          leave: async () => {
            session.currentScene = null;
            await this.sessionRepo.save(session);
          },
          state: session.sessionData
        };
      } catch (error) {
        console.error('Session middleware error:', error);
      }
    }

    next();
  }
}
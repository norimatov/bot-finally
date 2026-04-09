// src/common/guards/session.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { SceneContext } from '../../modules/bot/scenes/scane-contestx.interface';

@Injectable()
export class SessionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = TelegrafExecutionContext.create(context);
    const telegrafCtx = ctx.getContext<SceneContext>();
    
    // Session mavjudligini tekshirish
    if (!telegrafCtx.session) {
      telegrafCtx.session = {};
    }
    
    // Scene mavjudligini tekshirish (agar kerak bo'lsa)
    if (!telegrafCtx.scene) {
      console.log('⚠️ Scene mavjud emas! Session middleware ishlayaptimi?');
    }
    
    return true;
  }
}
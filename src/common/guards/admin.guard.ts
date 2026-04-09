// src/modules/bot/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = TelegrafExecutionContext.create(context);
    const telegrafCtx = ctx.getContext<{ from: { id: number } }>();
    
    const telegramId = telegrafCtx.from?.id;
    if (!telegramId) {
      console.log('❌ Telegram ID topilmadi');
      return false;
    }
    
    // ✅ String ga o'zgartirilgan - TO'G'RI
    const user = await this.userRepo.findOne({
      where: { telegramId: String(telegramId) }
    });
    
    if (!user) {
      console.log('❌ User topilmadi');
      return false;
    }
    
    const isAdmin = user.role === 'admin';
    console.log(`👤 User: ${user.firstName}, Rol: ${user.role}, Adminmi: ${isAdmin}`);
    
    return isAdmin;
  }
}
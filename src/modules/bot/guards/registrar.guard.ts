import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';

@Injectable()
export class RegistrarGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = TelegrafExecutionContext.create(context);
    const telegrafCtx = ctx.getContext<{ from: { id: number } }>();
    
    const telegramId = telegrafCtx.from?.id;
    if (!telegramId) return false;
    
    const user = await this.userRepo.findOne({
      where: { telegramId: String(telegramId) }
    });
    
    return user?.role === 'registrar' || user?.role === 'admin';
  }
}
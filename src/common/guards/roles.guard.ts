// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Handler dan roles meta ma'lumotini olish
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    // Agar roles talab qilinmasa, ruxsat berish
    if (!requiredRoles) {
      return true;
    }

    const ctx = TelegrafExecutionContext.create(context);
    const telegrafCtx = ctx.getContext<{ from: { id: number } }>();
    
    const telegramId = telegrafCtx.from?.id;
    if (!telegramId) return false;
    
    // Userni bazadan olish
    const user = await this.userRepo.findOne({
      where: { telegramId: String(telegramId) }
    });
    
    if (!user) return false;
    
    // User roli talab qilingan rollar ichida bormi?
    return requiredRoles.includes(user.role);
  }
}
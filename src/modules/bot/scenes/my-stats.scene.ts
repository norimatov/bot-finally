import { Injectable } from '@nestjs/common';
import { Scene, SceneEnter, Ctx } from 'nestjs-telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Kpi } from '../../../database/entities/kpi.entity';
import { DateUtil } from '../../../common/utils/date.util';
import { SceneContext } from './scane-contestx.interface';
import { SCENES } from '../../../common/constants/bot.constants';

@Scene(SCENES.myStats)
@Injectable()
export class MyStatsScene {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Kpi) private kpiRepo: Repository<Kpi>,
  ) {}

  @SceneEnter()
  async onEnter(@Ctx() ctx: SceneContext) {
    try {
      const telegramId = ctx.from?.id;
      if (!telegramId) {
        await ctx.reply('❌ Foydalanuvchi topilmadi!');
        await this.leaveScene(ctx);
        return;
      }

      const user = await this.userRepo.findOne({ 
        where: { telegramId: String(telegramId) } 
      });
      
      if (!user) {
        await ctx.reply('❌ Foydalanuvchi topilmadi!');
        await this.leaveScene(ctx);
        return;
      }

      const today = DateUtil.getToday();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayKpis = await this.kpiRepo.find({
        where: {
          userId: user.id,
          createdAt: Between(today, tomorrow)
        }
      });
      
      const monthStart = DateUtil.getMonthStart();
      const monthKpis = await this.kpiRepo.find({
        where: {
          userId: user.id,
          createdAt: Between(monthStart, new Date())
        }
      });
      
      const todayCount = todayKpis.length;
      const todayAmount = todayKpis.reduce((sum, k) => sum + Number(k.amount), 0);
      const monthCount = monthKpis.length;
      const monthAmount = monthKpis.reduce((sum, k) => sum + Number(k.amount), 0);
      
      const roleEmoji = user.role === 'admin' ? '👑' : user.role === 'operator' ? '🎮' : '📋';
      
      await ctx.reply(
        `🏠 <b>MENING NATIJAM</b>\n\n` +
        `${roleEmoji} <b>${user.firstName || user.username}</b>\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `📅 <b>BUGUN:</b>\n` +
        `  • Qo'shilgan: ${todayCount} ta\n` +
        `  • Daromad: <b>${todayAmount.toLocaleString()} so'm</b>\n\n` +
        `📆 <b>BU OY:</b>\n` +
        `  • Qo'shilgan: ${monthCount} ta\n` +
        `  • Daromad: <b>${monthAmount.toLocaleString()} so'm</b>`,
        { parse_mode: 'HTML' }
      );
      
    } catch (error) {
      await ctx.reply('❌ Xatolik yuz berdi!');
    } finally {
      await this.leaveScene(ctx);
    }
  }

  private async leaveScene(ctx: SceneContext): Promise<void> {
    try {
      if (ctx.scene && typeof ctx.scene.leave === 'function') {
        await ctx.scene.leave();
      }
    } catch (error) {
      console.error('Scene leave error:', error);
    }
  }
}
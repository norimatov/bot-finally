import { Injectable } from '@nestjs/common';
import { Scene, SceneEnter, Ctx } from 'nestjs-telegraf';
import { SceneContext } from './scane-contestx.interface';
import { SCENES } from '../../../common/constants/bot.constants';

@Scene(SCENES.rules)
@Injectable()
export class RulesScene {
  @SceneEnter()
  async onEnter(@Ctx() ctx: SceneContext) {
    await ctx.reply(
      '📋 <b>QOIDALAR</b>\n\n' +
      '<b>1️⃣ AVTOMOBIL QO\'SHISH:</b>\n' +
      '• Raqam: <code>01A123BB</code>\n' +
      '• Telefon: <code>998901234567</code>\n' +
      '• Sana: Kalendardan tanlanadi\n\n' +
      '<b>2️⃣ KPI TIZIMI:</b>\n' +
      '• 1 ta avtomobil = 2500 so\'m\n' +
      '• 1 ta HOT lead = 7000 so\'m\n' +
      '• 1 ta WARM lead = 5000 so\'m\n' +
      '• 1 ta COLD lead = 3000 so\'m\n\n' +
      '<b>3️⃣ BONUSLAR:</b>\n' +
      '• 1-o\'rin: 100000 so\'m\n' +
      '• 2-o\'rin: 50000 so\'m\n' +
      '• 3-o\'rin: 25000 so\'m',
      { parse_mode: 'HTML' }
    );
    await this.leaveScene(ctx);
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
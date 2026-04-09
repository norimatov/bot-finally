import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramService } from './telegram.service';
import { SessionMiddleware } from './middleware/session.middleware';
import { BotSession } from '../database/entities/bot-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BotSession])],
  providers: [TelegramService, SessionMiddleware],
  exports: [TelegramService, SessionMiddleware],
})
export class TelegramModule {}
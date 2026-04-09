// src/modules/moderation/moderation.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';
import { Car } from '../../database/entities/car.entity';
import { User } from '../../database/entities/user.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { BotModule } from '../bot/bot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Car, User, CarInsurance]),
    forwardRef(() => BotModule), // Aylanma bog'liqlik uchun
  ],
  providers: [ModerationService],
  controllers: [ModerationController],
  exports: [ModerationService],
})
export class ModerationModule {}
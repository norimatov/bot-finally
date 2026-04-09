// src/modules/user/user.module.ts
import { Module, forwardRef } from '@nestjs/common';  // 🔥 forwardRef import qilindi
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../../database/entities/user.entity';
import { BotModule } from '../bot/bot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),  // ✅ User entity TypeORM ga ro'yxatdan o'tkazilgan
    forwardRef(() => BotModule),  // 🔥 forwardRef bilan o'ralgan BotModule
  ],
  providers: [
    UserService,  // ✅ Service providerda
  ],
  controllers: [
    UserController,  // ✅ Controller (agar kerak bo'lsa)
  ],
  exports: [
    UserService,  // ✅ Boshqa modullarda ishlatish uchun export
  ]
})
export class UserModule {}
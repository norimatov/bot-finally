import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';

// Entities
import { User } from './database/entities/user.entity';
import { Car } from './database/entities/car.entity';
import { CarInsurance } from './database/entities/insurance.entity';
import { Lead } from './database/entities/lead.entity';
import { Kpi } from './database/entities/kpi.entity';
import { Notification } from './database/entities/notification.entity';
import { DailyStat } from './database/entities/daily-stat.entity';
import { BotSession } from './database/entities/bot-session.entity';
import { Moderation } from './database/entities/moderation.entity'; // 🔥 MODERATION ENTITY QO'SHILDI

// Modules
import { BotModule } from './modules/bot/bot.module';
import { UserModule } from './modules/user/user.module';
import { CarModule } from './modules/car/car.module';
import { InsuranceModule } from './modules/insurance/insurance.module';
import { LeadModule } from './modules/lead/lead.module';
import { KpiModule } from './modules/kpi/kpi.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { TelegramModule } from './telegram/telegram.module';
import { ModerationModule } from './modules/moderation/moderation.module'; // 🔥 MODERATION MODULE QO'SHILDI

@Module({
  imports: [
    // Konfiguratsiya - .env faylni yuklash
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env'
    }),
    
    // PostgreSQL ma'lumotlar bazasi
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'root1'),
        database: config.get<string>('DB_DATABASE', 'insurance_db'),
        entities: [
          User,
          Car,
          CarInsurance,
          Lead,
          Kpi,
          Notification,
          DailyStat,
          BotSession,
          Moderation, // 🔥 MODERATION ENTITY QO'SHILDI
        ],
        synchronize: config.get<string>('NODE_ENV') === 'development', // developmentda true
        logging: config.get<string>('NODE_ENV') === 'development',     // developmentda true
        retryAttempts: 5,      // Qayta urinishlar soni
        retryDelay: 3000,      // Urinishlar orasidagi vaqt (ms)
      }),
    }),
    
    // Schedule moduli - avtomatik ishlar uchun
    ScheduleModule.forRoot(),
    
    // Telegram bot - SESSION BILAN
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const token = config.get<string>('BOT_TOKEN');
        
        if (!token) {
          throw new Error('❌ BOT_TOKEN topilmadi! .env faylini tekshiring.');
        }
        
        console.log('🤖 Bot token tekshirildi');
        
        return {
          token,
          middlewares: [session()],  // ✅ Session middleware - MUHIM!
          launchOptions: {
            dropPendingUpdates: true  // Bot ishga tushganda kutilayotgan xabarlarni o'chirish
          }
        };
      },
    }),
    
    // Feature modullari
    BotModule,
    UserModule,
    CarModule,
    InsuranceModule,
    LeadModule,
    KpiModule,
    NotificationModule,
    AdminModule,
    TelegramModule,
    ModerationModule, // 🔥 MODERATION MODULE QO'SHILDI
  ],
})
export class AppModule {}
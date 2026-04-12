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
import { Moderation } from './database/entities/moderation.entity';

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
import { ModerationModule } from './modules/moderation/moderation.module';

@Module({
  imports: [
    // Konfiguratsiya - .env faylni yuklash
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),

    // PostgreSQL ma'lumotlar bazasi - 🔥 RENDER UCHUN QAT'IY TUZATILDI
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');

        if (databaseUrl) {
          console.log('✅ DATABASE_URL orqali ulanish');
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [
              User, Car, CarInsurance, Lead, Kpi,
              Notification, DailyStat, BotSession, Moderation
            ],
            synchronize: true,
            logging: false,
            retryAttempts: 10,
            retryDelay: 3000,
            // 🔥 SSL sozlamalari - self-signed certificate uchun
            ssl: {
              rejectUnauthorized: false,
            },
            // 🔥 Qo'shimcha sozlamalar
            extra: {
              ssl: {
                rejectUnauthorized: false,
              },
            },
          };
        }

        // Local ulanish
        console.log('📁 Local database ulanishi');
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', 'root1'),
          database: config.get<string>('DB_DATABASE', 'insurance_db'),
          entities: [
            User, Car, CarInsurance, Lead, Kpi,
            Notification, DailyStat, BotSession, Moderation
          ],
          synchronize: true,
          logging: true,
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
    }),

    ScheduleModule.forRoot(),

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
          middlewares: [session()],
          launchOptions: {
            dropPendingUpdates: true
          }
        };
      },
    }),

    BotModule,
    UserModule,
    CarModule,
    InsuranceModule,
    LeadModule,
    KpiModule,
    NotificationModule,
    AdminModule,
    TelegramModule,
    ModerationModule,
  ],
})
export class AppModule { }
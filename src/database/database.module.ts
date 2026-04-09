import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Car } from './entities/car.entity';
import { CarInsurance } from './entities/insurance.entity';
import { Lead } from './entities/lead.entity';
import { Kpi } from './entities/kpi.entity';
import { Notification } from './entities/notification.entity';
import { DailyStat } from './entities/daily-stat.entity';
import { BotSession } from './entities/bot-session.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'insurance_db'),
        entities: [
          User,
          Car,
          CarInsurance,
          Lead,
          Kpi,
          Notification,
          DailyStat,
          BotSession
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
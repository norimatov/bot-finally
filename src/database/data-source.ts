import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Car } from './entities/car.entity';
import { CarInsurance } from './entities/insurance.entity';
import { Lead } from './entities/lead.entity';
import { Kpi } from './entities/kpi.entity';
import { Notification } from './entities/notification.entity';
import { DailyStat } from './entities/daily-stat.entity';
import { BotSession } from './entities/bot-session.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'insurance_db',
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
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
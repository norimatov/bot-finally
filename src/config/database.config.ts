
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from './config.service';

export const databaseConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.dbHost,
  port: config.dbPort,
  username: config.dbUser,
  password: config.dbPass,
  database: config.dbName,
  entities: [__dirname + '/../database/entities/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
});
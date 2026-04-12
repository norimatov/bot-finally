import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private config: NestConfigService) { }

  get botToken(): string {
    return this.config.get<string>('BOT_TOKEN');
  }

  get dbHost(): string {
    return this.config.get<string>('DB_HOST', 'localhost');
  }

  get dbPort(): number {
    return this.config.get<number>('DB_PORT', 5432);
  }

  get dbUser(): string {
    return this.config.get<string>('DB_USERNAME', 'postgres');
  }

  get dbPass(): string {
    return this.config.get<string>('DB_PASSWORD', 'root1');
  }

  get dbName(): string {
    return this.config.get<string>('DB_DATABASE', 'insurance_db');
  }

  get adminIds(): number[] {
    const adminIdsStr = this.config.get<string>('ADMIN_IDS', '');
    if (!adminIdsStr) {
      return [];
    }
    return adminIdsStr.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  }

  get port(): number {
    return this.config.get<number>('PORT', 3000);
  }

  get appUrl(): string {
    return this.config.get<string>('APP_URL', 'http://localhost:3000');
  }

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV', 'development');
  }

  get databaseUrl(): string {
    return this.config.get<string>('DATABASE_URL');
  }

  // 🔥 Qo'shimcha yordamchi metod
  get<T = any>(key: string, defaultValue?: T): T {
    return this.config.get<T>(key, defaultValue);
  }
}
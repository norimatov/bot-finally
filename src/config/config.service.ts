import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private config: NestConfigService) {}
  get botToken(): string { return this.config.get('BOT_TOKEN'); }
  get dbHost(): string { return this.config.get('DB_HOST'); }
  get dbPort(): number { return +this.config.get('DB_PORT'); }
  get dbUser(): string { return this.config.get('DB_USERNAME'); }
  get dbPass(): string { return this.config.get('DB_PASSWORD'); }
  get dbName(): string { return this.config.get('DB_DATABASE'); }
  get adminIds(): number[] { 
    return this.config.get('ADMIN_IDS').split(',').map(Number);
  }
}
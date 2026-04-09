import { ConfigService as NestConfigService } from '@nestjs/config';
export declare class ConfigService {
    private config;
    constructor(config: NestConfigService);
    get botToken(): string;
    get dbHost(): string;
    get dbPort(): number;
    get dbUser(): string;
    get dbPass(): string;
    get dbName(): string;
    get adminIds(): number[];
}

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from './config.service';
export declare const databaseConfig: (config: ConfigService) => TypeOrmModuleOptions;

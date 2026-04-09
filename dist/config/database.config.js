"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const databaseConfig = (config) => ({
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
exports.databaseConfig = databaseConfig;
//# sourceMappingURL=database.config.js.map
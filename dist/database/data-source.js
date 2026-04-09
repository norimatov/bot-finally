"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const user_entity_1 = require("./entities/user.entity");
const car_entity_1 = require("./entities/car.entity");
const insurance_entity_1 = require("./entities/insurance.entity");
const lead_entity_1 = require("./entities/lead.entity");
const kpi_entity_1 = require("./entities/kpi.entity");
const notification_entity_1 = require("./entities/notification.entity");
const daily_stat_entity_1 = require("./entities/daily-stat.entity");
const bot_session_entity_1 = require("./entities/bot-session.entity");
(0, dotenv_1.config)();
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'insurance_db',
    entities: [
        user_entity_1.User,
        car_entity_1.Car,
        insurance_entity_1.CarInsurance,
        lead_entity_1.Lead,
        kpi_entity_1.Kpi,
        notification_entity_1.Notification,
        daily_stat_entity_1.DailyStat,
        bot_session_entity_1.BotSession
    ],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
    logging: true,
});
//# sourceMappingURL=data-source.js.map
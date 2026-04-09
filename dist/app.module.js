"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const user_entity_1 = require("./database/entities/user.entity");
const car_entity_1 = require("./database/entities/car.entity");
const insurance_entity_1 = require("./database/entities/insurance.entity");
const lead_entity_1 = require("./database/entities/lead.entity");
const kpi_entity_1 = require("./database/entities/kpi.entity");
const notification_entity_1 = require("./database/entities/notification.entity");
const daily_stat_entity_1 = require("./database/entities/daily-stat.entity");
const bot_session_entity_1 = require("./database/entities/bot-session.entity");
const moderation_entity_1 = require("./database/entities/moderation.entity");
const bot_module_1 = require("./modules/bot/bot.module");
const user_module_1 = require("./modules/user/user.module");
const car_module_1 = require("./modules/car/car.module");
const insurance_module_1 = require("./modules/insurance/insurance.module");
const lead_module_1 = require("./modules/lead/lead.module");
const kpi_module_1 = require("./modules/kpi/kpi.module");
const notification_module_1 = require("./modules/notification/notification.module");
const admin_module_1 = require("./modules/admin/admin.module");
const telegram_module_1 = require("./telegram/telegram.module");
const moderation_module_1 = require("./modules/moderation/moderation.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env'
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST', 'localhost'),
                    port: config.get('DB_PORT', 5432),
                    username: config.get('DB_USERNAME', 'postgres'),
                    password: config.get('DB_PASSWORD', 'root1'),
                    database: config.get('DB_DATABASE', 'insurance_db'),
                    entities: [
                        user_entity_1.User,
                        car_entity_1.Car,
                        insurance_entity_1.CarInsurance,
                        lead_entity_1.Lead,
                        kpi_entity_1.Kpi,
                        notification_entity_1.Notification,
                        daily_stat_entity_1.DailyStat,
                        bot_session_entity_1.BotSession,
                        moderation_entity_1.Moderation,
                    ],
                    synchronize: config.get('NODE_ENV') === 'development',
                    logging: config.get('NODE_ENV') === 'development',
                    retryAttempts: 5,
                    retryDelay: 3000,
                }),
            }),
            schedule_1.ScheduleModule.forRoot(),
            nestjs_telegraf_1.TelegrafModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const token = config.get('BOT_TOKEN');
                    if (!token) {
                        throw new Error('❌ BOT_TOKEN topilmadi! .env faylini tekshiring.');
                    }
                    console.log('🤖 Bot token tekshirildi');
                    return {
                        token,
                        middlewares: [(0, telegraf_1.session)()],
                        launchOptions: {
                            dropPendingUpdates: true
                        }
                    };
                },
            }),
            bot_module_1.BotModule,
            user_module_1.UserModule,
            car_module_1.CarModule,
            insurance_module_1.InsuranceModule,
            lead_module_1.LeadModule,
            kpi_module_1.KpiModule,
            notification_module_1.NotificationModule,
            admin_module_1.AdminModule,
            telegram_module_1.TelegramModule,
            moderation_module_1.ModerationModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bot_service_1 = require("./bot.service");
const bot_update_1 = require("./bot.update");
const add_car_scene_1 = require("./scenes/add-car.scene");
const my_stats_scene_1 = require("./scenes/my-stats.scene");
const rules_scene_1 = require("./scenes/rules.scene");
const main_keyboard_1 = require("./keyboards/main.keyboard");
const admin_keyboard_1 = require("./keyboards/admin.keyboard");
const operator_keyboard_1 = require("./keyboards/operator.keyboard");
const registrar_guard_1 = require("./guards/registrar.guard");
const operator_guard_1 = require("./guards/operator.guard");
const admin_guard_1 = require("./guards/admin.guard");
const user_entity_1 = require("../../database/entities/user.entity");
const car_entity_1 = require("../../database/entities/car.entity");
const insurance_entity_1 = require("../../database/entities/insurance.entity");
const lead_entity_1 = require("../../database/entities/lead.entity");
const kpi_entity_1 = require("../../database/entities/kpi.entity");
const daily_stat_entity_1 = require("../../database/entities/daily-stat.entity");
const moderation_entity_1 = require("../../database/entities/moderation.entity");
const config_module_1 = require("../../config/config.module");
const user_module_1 = require("../user/user.module");
const car_module_1 = require("../car/car.module");
const insurance_module_1 = require("../insurance/insurance.module");
const lead_module_1 = require("../lead/lead.module");
const kpi_module_1 = require("../kpi/kpi.module");
const exel_module_1 = require("../../shared/exel/exel.module");
const moderation_module_1 = require("../moderation/moderation.module");
let BotModule = class BotModule {
};
exports.BotModule = BotModule;
exports.BotModule = BotModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                car_entity_1.Car,
                insurance_entity_1.CarInsurance,
                lead_entity_1.Lead,
                kpi_entity_1.Kpi,
                daily_stat_entity_1.DailyStat,
                moderation_entity_1.Moderation,
            ]),
            config_module_1.ConfigModule,
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            car_module_1.CarModule,
            insurance_module_1.InsuranceModule,
            lead_module_1.LeadModule,
            kpi_module_1.KpiModule,
            exel_module_1.ExcelModule,
            moderation_module_1.ModerationModule,
        ],
        providers: [
            bot_service_1.BotService,
            bot_update_1.BotUpdate,
            add_car_scene_1.AddCarScene,
            my_stats_scene_1.MyStatsScene,
            rules_scene_1.RulesScene,
            main_keyboard_1.MainKeyboard,
            admin_keyboard_1.AdminKeyboard,
            operator_keyboard_1.OperatorKeyboard,
            registrar_guard_1.RegistrarGuard,
            operator_guard_1.OperatorGuard,
            admin_guard_1.AdminGuard,
        ],
        exports: [
            bot_service_1.BotService,
            main_keyboard_1.MainKeyboard,
            admin_keyboard_1.AdminKeyboard,
            operator_keyboard_1.OperatorKeyboard,
        ]
    })
], BotModule);
//# sourceMappingURL=bot.module.js.map
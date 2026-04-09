"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lead_service_1 = require("./lead.service");
const lead_controller_1 = require("./lead.controller");
const lead_entity_1 = require("../../database/entities/lead.entity");
const insurance_entity_1 = require("../../database/entities/insurance.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const car_entity_1 = require("../../database/entities/car.entity");
const car_module_1 = require("../car/car.module");
const kpi_module_1 = require("../kpi/kpi.module");
const bot_module_1 = require("../bot/bot.module");
let LeadModule = class LeadModule {
};
exports.LeadModule = LeadModule;
exports.LeadModule = LeadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                lead_entity_1.Lead,
                insurance_entity_1.CarInsurance,
                user_entity_1.User,
                car_entity_1.Car
            ]),
            car_module_1.CarModule,
            kpi_module_1.KpiModule,
            (0, common_1.forwardRef)(() => bot_module_1.BotModule),
        ],
        providers: [lead_service_1.LeadService],
        controllers: [lead_controller_1.LeadController],
        exports: [lead_service_1.LeadService]
    })
], LeadModule);
//# sourceMappingURL=lead.module.js.map
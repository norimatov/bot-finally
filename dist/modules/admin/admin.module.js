"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_service_1 = require("./admin.service");
const admin_controller_1 = require("./admin.controller");
const user_entity_1 = require("../../database/entities/user.entity");
const car_entity_1 = require("../../database/entities/car.entity");
const insurance_entity_1 = require("../../database/entities/insurance.entity");
const lead_entity_1 = require("../../database/entities/lead.entity");
const kpi_entity_1 = require("../../database/entities/kpi.entity");
const daily_stat_entity_1 = require("../../database/entities/daily-stat.entity");
const kpi_module_1 = require("../kpi/kpi.module");
const exel_service_1 = require("../../shared/exel/exel.service");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, car_entity_1.Car, insurance_entity_1.CarInsurance, lead_entity_1.Lead, kpi_entity_1.Kpi, daily_stat_entity_1.DailyStat]),
            kpi_module_1.KpiModule
        ],
        providers: [admin_service_1.AdminService, exel_service_1.ExcelService],
        controllers: [admin_controller_1.AdminController],
        exports: [admin_service_1.AdminService]
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map
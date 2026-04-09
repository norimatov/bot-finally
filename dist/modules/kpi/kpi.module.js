"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const kpi_service_1 = require("./kpi.service");
const kpi_controller_1 = require("./kpi.controller");
const kpi_entity_1 = require("../../database/entities/kpi.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const daily_stat_entity_1 = require("../../database/entities/daily-stat.entity");
let KpiModule = class KpiModule {
};
exports.KpiModule = KpiModule;
exports.KpiModule = KpiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([kpi_entity_1.Kpi, user_entity_1.User, daily_stat_entity_1.DailyStat])
        ],
        providers: [kpi_service_1.KpiService],
        controllers: [kpi_controller_1.KpiController],
        exports: [kpi_service_1.KpiService]
    })
], KpiModule);
//# sourceMappingURL=kpi.module.js.map
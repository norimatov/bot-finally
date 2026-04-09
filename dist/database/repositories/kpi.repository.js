"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const kpi_entity_1 = require("../entities/kpi.entity");
const date_util_1 = require("../../common/utils/date.util");
let KpiRepository = class KpiRepository extends typeorm_1.Repository {
    constructor(dataSource) {
        super(kpi_entity_1.Kpi, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async getTodayStats(userId) {
        const today = date_util_1.DateUtil.getToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const kpis = await this.find({
            where: {
                userId: userId,
                createdAt: (0, typeorm_1.Between)(today, tomorrow)
            }
        });
        return {
            count: kpis.length,
            total: kpis.reduce((sum, k) => sum + Number(k.amount), 0)
        };
    }
    async getMonthStats(userId) {
        const monthStart = date_util_1.DateUtil.getMonthStart();
        const kpis = await this.find({
            where: {
                userId: userId,
                createdAt: (0, typeorm_1.Between)(monthStart, new Date())
            }
        });
        return {
            count: kpis.length,
            total: kpis.reduce((sum, k) => sum + Number(k.amount), 0)
        };
    }
};
exports.KpiRepository = KpiRepository;
exports.KpiRepository = KpiRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], KpiRepository);
//# sourceMappingURL=kpi.repository.js.map
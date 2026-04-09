"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const moderation_service_1 = require("./moderation.service");
const moderation_controller_1 = require("./moderation.controller");
const car_entity_1 = require("../../database/entities/car.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const insurance_entity_1 = require("../../database/entities/insurance.entity");
const bot_module_1 = require("../bot/bot.module");
let ModerationModule = class ModerationModule {
};
exports.ModerationModule = ModerationModule;
exports.ModerationModule = ModerationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([car_entity_1.Car, user_entity_1.User, insurance_entity_1.CarInsurance]),
            (0, common_1.forwardRef)(() => bot_module_1.BotModule),
        ],
        providers: [moderation_service_1.ModerationService],
        controllers: [moderation_controller_1.ModerationController],
        exports: [moderation_service_1.ModerationService],
    })
], ModerationModule);
//# sourceMappingURL=moderation.module.js.map
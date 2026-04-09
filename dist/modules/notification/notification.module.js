"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_service_1 = require("./notification.service");
const notification_controller_1 = require("./notification.controller");
const notification_scheduler_1 = require("./notification.scheduler");
const notification_entity_1 = require("../../database/entities/notification.entity");
const insurance_entity_1 = require("../../database/entities/insurance.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const lead_entity_1 = require("../../database/entities/lead.entity");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([notification_entity_1.Notification, insurance_entity_1.CarInsurance, user_entity_1.User, lead_entity_1.Lead])
        ],
        providers: [notification_service_1.NotificationService, notification_scheduler_1.NotificationScheduler],
        controllers: [notification_controller_1.NotificationController],
        exports: [notification_service_1.NotificationService]
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map
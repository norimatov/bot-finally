// src/modules/lead/lead.module.ts
import { Module, forwardRef } from '@nestjs/common';  // 🔥 forwardRef import
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { Lead } from '../../database/entities/lead.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { User } from '../../database/entities/user.entity';
import { Car } from '../../database/entities/car.entity';  // 🔥 Car entity import
import { CarModule } from '../car/car.module';
import { KpiModule } from '../kpi/kpi.module';
import { BotModule } from '../bot/bot.module';  // 🔥 BotModule import

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      CarInsurance,
      User,
      Car  // 🔥 Car entity qo'shildi
    ]),
    CarModule,
    KpiModule,
    forwardRef(() => BotModule),  // 🔥 BotModule ni forwardRef bilan import
  ],
  providers: [LeadService],
  controllers: [LeadController],
  exports: [LeadService]
})
export class LeadModule {}
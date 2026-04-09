import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// Bot komponentlari
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';

// Scenes
import { AddCarScene } from './scenes/add-car.scene';
import { MyStatsScene } from './scenes/my-stats.scene';
import { RulesScene } from './scenes/rules.scene';

// Keyboards
import { MainKeyboard } from './keyboards/main.keyboard';
import { AdminKeyboard } from './keyboards/admin.keyboard';
import { OperatorKeyboard } from './keyboards/operator.keyboard';

// Guards
import { RegistrarGuard } from './guards/registrar.guard';
import { OperatorGuard } from './guards/operator.guard';
import { AdminGuard } from './guards/admin.guard';

// Entities
import { User } from '../../database/entities/user.entity';
import { Car } from '../../database/entities/car.entity';
import { CarInsurance } from '../../database/entities/insurance.entity';
import { Lead } from '../../database/entities/lead.entity';
import { Kpi } from '../../database/entities/kpi.entity';
import { DailyStat } from '../../database/entities/daily-stat.entity';
import { Moderation } from '../../database/entities/moderation.entity';
 
// Modules
import { ConfigModule } from '../../config/config.module';
import { UserModule } from '../user/user.module';
import { CarModule } from '../car/car.module';
import { InsuranceModule } from '../insurance/insurance.module';
import { LeadModule } from '../lead/lead.module';
import { KpiModule } from '../kpi/kpi.module';
import { ExcelModule } from '../../shared/exel/exel.module';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Car,
      CarInsurance,
      Lead,
      Kpi,
      DailyStat,
      Moderation,
    ]),
    
    // 🔥 TelegrafModule YO'Q - bu yerda bo'lmasligi kerak!
    
    ConfigModule,
    forwardRef(() => UserModule),
    CarModule,
    InsuranceModule,
    LeadModule,
    KpiModule,
    ExcelModule,
    ModerationModule,
  ],
  providers: [
    BotService,
    BotUpdate,
    AddCarScene,
    MyStatsScene,
    RulesScene,
    MainKeyboard,
    AdminKeyboard,
    OperatorKeyboard,
    RegistrarGuard,
    OperatorGuard,
    AdminGuard,
  ],
  exports: [
    BotService,
    MainKeyboard,
    AdminKeyboard,
    OperatorKeyboard,
  ]
})
export class BotModule {}
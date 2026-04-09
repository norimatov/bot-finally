import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KpiService } from './kpi.service';
import { KpiController } from './kpi.controller';
import { Kpi } from '../../database/entities/kpi.entity';
import { User } from '../../database/entities/user.entity';
import { DailyStat } from '../../database/entities/daily-stat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kpi, User, DailyStat])
  ],
  providers: [KpiService],
  controllers: [KpiController],
  exports: [KpiService] // ✅ KpiService eksport qilingan
})
export class KpiModule {}
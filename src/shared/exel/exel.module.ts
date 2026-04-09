// src/modules/excel/excel.module.ts
import { Module } from '@nestjs/common';
import { ExcelService } from './exel.service'

@Module({
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}

import { IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CalculateKpiDto {
  @IsNumber()
  user_id: number;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;
}


import { IsNumber, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateLeadDto {
  @IsNumber()
  car_id: number;

  @IsNumber()
  insurance_id: number;

  @IsNumber()
  @IsOptional()
  operator_id?: number;

  @IsString()
  @IsIn(['HOT', 'WARM'])
  lead_type: string;

  @IsString()
  @IsOptional()
  @IsIn(['new', 'closed', 'postponed', 'rejected'])
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
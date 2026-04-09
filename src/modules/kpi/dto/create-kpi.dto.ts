
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateKpiDto {
  @IsNumber()
  user_id: number;

  @IsString()
  action: string;

  @IsNumber()
  @IsOptional()
  points?: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  reference_id?: number;
}


import { IsNumber, IsDate, IsString, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInsuranceDto {
  @IsNumber()
  car_id: number;

  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @IsDate()
  @Type(() => Date)
  end_date: Date;

  @IsString()
  @IsOptional()
  @IsIn(['active', 'expired', 'cancelled', 'renewed'])
  status?: string;

  @IsNumber()
  created_by_id: number;
}

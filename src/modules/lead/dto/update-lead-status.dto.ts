
import { IsString, IsIn, IsNumber, IsOptional } from 'class-validator';

export class UpdateLeadStatusDto {
  @IsString()
  @IsIn(['new', 'closed', 'postponed', 'rejected'])
  status: string;

  @IsNumber()
  operator_id: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

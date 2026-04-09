import { IsString, IsIn, IsOptional } from 'class-validator';

export class ExportDto {
  @IsString()
  @IsIn(['daily', 'monthly', 'all', 'users', 'payments'])
  type: string;

  @IsString()
  @IsOptional()
  start_date?: string;

  @IsString()
  @IsOptional()
  end_date?: string;
}

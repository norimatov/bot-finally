import { IsString, IsOptional, IsNumber, Matches } from 'class-validator';

export class CreateCarDto {
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{2}$/i, { message: 'Notog\'ri avtomobil raqami formati' })
  plate_number: string;

  @IsString()
  @Matches(/^998[0-9]{9}$/, { message: 'Notog\'ri telefon raqami formati' })
  owner_phone: string;

  @IsString()
  @IsOptional()
  owner_name?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsNumber()
  created_by_id: number;
}

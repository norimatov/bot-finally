
import { IsString, IsOptional, IsNumber, IsBoolean, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  telegram_id: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^998[0-9]{9}$/, { message: 'Notog\'ri telefon raqami formati' })
  phone?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

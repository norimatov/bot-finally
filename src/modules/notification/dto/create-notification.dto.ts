
import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  user_id: number;

  @IsString()
  type: string;

  @IsString()
  message: string;

  @IsBoolean()
  @IsOptional()
  is_read?: boolean;
}
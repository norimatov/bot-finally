
import { IsString, IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['active', 'expired', 'cancelled', 'renewed'])
  status: string;
}

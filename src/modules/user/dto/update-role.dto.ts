import { IsString, IsIn } from 'class-validator';
import { ROLES } from '../../../common/constants/bot.constants';

export class UpdateRoleDto {
  @IsString()
  @IsIn([ROLES.registrar, ROLES.operator, ROLES.admin])
  role: string;
}
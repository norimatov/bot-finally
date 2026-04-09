
import { SetMetadata } from '@nestjs/common';
import { ROLES } from '../constants/bot.constants';

export const Roles = (...roles: (keyof typeof ROLES)[]) => SetMetadata('roles', roles);

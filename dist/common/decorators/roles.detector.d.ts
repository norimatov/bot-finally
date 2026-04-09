import { ROLES } from '../constants/bot.constants';
export declare const Roles: (...roles: (keyof typeof ROLES)[]) => import("@nestjs/common").CustomDecorator<string>;

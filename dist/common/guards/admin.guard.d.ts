import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
export declare class AdminGuard implements CanActivate {
    private userRepo;
    constructor(userRepo: Repository<User>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}

import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
export declare class RolesGuard implements CanActivate {
    private reflector;
    private userRepo;
    constructor(reflector: Reflector, userRepo: Repository<User>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}

import { UserService } from './user.service';
import { User } from '../../database/entities/user.entity';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(): Promise<User[]>;
    getActive(): Promise<User[]>;
    getByRole(role: string): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByTelegramId(telegramId: string): Promise<User>;
    create(userData: Partial<User>): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User>;
    updateRole(id: string, role: string): Promise<User>;
    remove(id: string): Promise<void>;
}

import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../database/entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('active')
  async getActive(): Promise<User[]> {
    return this.userService.getActiveUsers();
  }

  @Get('role/:role')
  async getByRole(@Param('role') role: string): Promise<User[]> {
    return this.userService.getByRole(role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(parseInt(id));
  }

  @Get('telegram/:telegramId')
  async findByTelegramId(@Param('telegramId') telegramId: string): Promise<User> {
    return this.userService.findByTelegramId(String(telegramId));
  }

  @Post()
  async create(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.create(userData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() userData: Partial<User>): Promise<User> {
    return this.userService.update(parseInt(id), userData);
  }

  @Put(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string): Promise<User> {
    return this.userService.updateRole(parseInt(id), role);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(parseInt(id));
  }
}
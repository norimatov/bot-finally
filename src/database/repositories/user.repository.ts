// src/database/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByTelegramId(telegramId: string): Promise<User> {  // ✅ string
    return this.findOne({ where: { telegramId } });  // ✅ BigInt yo'q
  }

  async findByRole(role: string): Promise<User[]> {
    return this.find({ 
      where: { 
        role, 
        isActive: true 
      } 
    });
  }

  async getActiveUsers(): Promise<User[]> {
    return this.find({ 
      where: { isActive: true } 
    });
  }
}
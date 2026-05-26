import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async upsert(dto: CreateUserDto): Promise<User> {
    if (dto.email) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing) {
        Object.assign(existing, dto);
        return this.repo.save(existing);
      }
    }
    const user = this.repo.create(dto);
    return this.repo.save(user);
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}

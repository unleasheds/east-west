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

  findByGoogleId(googleId: string) {
    return this.repo.findOne({ where: { googleId } });
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async setAdmin(id: string, isAdmin: boolean) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    user.isAdmin = isAdmin;
    return this.repo.save(user);
  }

  /** Find existing user by email or googleId, or create a new one */
  async findOrCreateByGoogle(profile: {
    googleId: string;
    email: string;
    name: string;
    avatar: string;
  }): Promise<User> {
    // Try by googleId first (fastest path on repeated logins)
    let user = await this.repo.findOne({ where: { googleId: profile.googleId } });
    if (user) {
      if (!user.isAdmin && profile.email === 'unleasheds@gmail.com') {
        user.isAdmin = true;
        return this.repo.save(user);
      }
      return user;
    }

    // Try by email (account may have been created without Google)
    if (profile.email) {
      user = await this.repo.findOne({ where: { email: profile.email } });
      if (user) {
        user.googleId = profile.googleId;
        user.avatar   = profile.avatar;
        if (!user.name) user.name = profile.name;
        user.isAdmin = profile.email === 'unleasheds@gmail.com';
        return this.repo.save(user);
      }
    }

    // New user
    const created = this.repo.create({
      googleId: profile.googleId,
      email:    profile.email,
      name:     profile.name,
      avatar:   profile.avatar,
      isAdmin:  profile.email === 'unleasheds@gmail.com',
    });
    return this.repo.save(created);
  }
}

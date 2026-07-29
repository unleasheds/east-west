import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserActivity } from './entities/user-activity.entity';
import { Package } from '../packages/entities/package.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Wishlist } from '../wishlist/entities/wishlist.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(UserActivity)
    private readonly activities: Repository<UserActivity>,
    @InjectRepository(Package)
    private readonly packages: Repository<Package>,
    @InjectRepository(Trip)
    private readonly trips: Repository<Trip>,
    @InjectRepository(Wishlist)
    private readonly wishlists: Repository<Wishlist>,
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

  async trackPackageView(userId: string, packageId: string) {
    const pkg = await this.packages.findOne({ where: { id: packageId, isActive: true } });
    if (!pkg) return { tracked: false };

    let activity = await this.activities.findOne({ where: { userId, packageId } });
    if (activity) {
      activity.viewCount += 1;
      activity.lastViewedAt = new Date();
    } else {
      activity = this.activities.create({
        userId,
        packageId,
        viewCount: 1,
        lastViewedAt: new Date(),
      });
    }
    await this.activities.save(activity);
    return { tracked: true };
  }

  async findAllWithActivity() {
    const users = await this.repo.find({ order: { createdAt: 'DESC' } });
    const userIds = users.map((user) => user.id);
    if (!userIds.length) return [];

    const [activities, trips, wishlists] = await Promise.all([
      this.activities.find({
        where: { userId: In(userIds) },
        order: { lastViewedAt: 'DESC' },
      }),
      this.trips.find({ where: { userId: In(userIds) } }),
      this.wishlists.find({ where: { userId: In(userIds) } }),
    ]);
    const packageIds = [...new Set(activities.map((activity) => activity.packageId))];
    const packages = packageIds.length
      ? await this.packages.find({ where: { id: In(packageIds) } })
      : [];
    const packageById = new Map(packages.map((pkg) => [pkg.id, pkg]));

    return users.map((user) => {
      const viewedPackages = activities
        .filter((activity) => activity.userId === user.id)
        .map((activity) => {
          const pkg = packageById.get(activity.packageId);
          return {
            packageId: activity.packageId,
            title: pkg?.title ?? 'Unavailable package',
            slug: pkg?.slug,
            destination: pkg?.destination,
            viewCount: activity.viewCount,
            lastViewedAt: activity.lastViewedAt,
          };
        });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        familySize: user.familySize,
        budget: user.budget,
        preferences: user.preferences,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        tripCount: trips.filter((trip) => trip.userId === user.id).length,
        wishlistCount: wishlists.filter((item) => item.userId === user.id).length,
        viewedPackages,
        lastActivityAt: viewedPackages[0]?.lastViewedAt ?? null,
      };
    });
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

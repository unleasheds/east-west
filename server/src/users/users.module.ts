import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserActivity } from './entities/user-activity.entity';
import { Package } from '../packages/entities/package.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Wishlist } from '../wishlist/entities/wishlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserActivity, Package, Trip, Wishlist])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

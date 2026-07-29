import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Package } from '../packages/entities/package.entity';
import { Trip, TripStatus } from '../trips/entities/trip.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviews: Repository<Review>,
    @InjectRepository(Trip) private readonly trips: Repository<Trip>,
    @InjectRepository(Package) private readonly packages: Repository<Package>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async findForPackage(packageId: string) {
    const rows = await this.reviews.find({
      where: { packageId },
      order: { createdAt: 'DESC' },
    });
    const userIds = [...new Set(rows.map((review) => review.userId))];
    const travellers = userIds.length
      ? await this.users.find({ where: { id: In(userIds) } })
      : [];
    const travellerNames = new Map(
      travellers.map((traveller) => [traveller.id, traveller.name]),
    );

    const count = rows.length;
    const rating = count
      ? rows.reduce((sum, row) => sum + Number(row.rating), 0) / count
      : 0;

    return {
      rating: Number(rating.toFixed(1)),
      reviewCount: count,
      reviews: rows.map((row) => ({
        id: row.id,
        rating: Number(row.rating),
        comment: row.comment,
        createdAt: row.createdAt,
        travellerName: travellerNames.get(row.userId)?.trim() || 'Verified traveller',
      })),
    };
  }

  async create(packageId: string, userId: string, dto: CreateReviewDto) {
    const pkg = await this.packages.findOne({ where: { id: packageId, isActive: true } });
    if (!pkg) throw new NotFoundException('Package not found');

    const completedTrip = await this.trips.findOne({
      where: { packageId, userId, status: TripStatus.COMPLETED },
    });
    if (!completedTrip) {
      throw new ForbiddenException(
        'Only travellers who booked and completed this trip can leave a review',
      );
    }

    const existing = await this.reviews.findOne({ where: { packageId, userId } });
    if (existing) throw new ConflictException('You have already reviewed this trip');

    await this.reviews.save(
      this.reviews.create({
        packageId,
        userId,
        rating: dto.rating,
        comment: dto.comment.trim(),
      }),
    );
    return this.findForPackage(packageId);
  }
}

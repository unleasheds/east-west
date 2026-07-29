import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from './entities/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly repo: Repository<Trip>,
  ) {}

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  create(dto: CreateTripDto) {
    const trip = this.repo.create(dto);
    return this.repo.save(trip);
  }

  async monthlyBookings(packageId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const trips = await this.repo
      .createQueryBuilder('trip')
      .select('trip.travellers', 'travellers')
      .where('trip.packageId = :packageId', { packageId })
      .andWhere('trip.status IN (:...statuses)', {
        statuses: [TripStatus.CONFIRMED, TripStatus.COMPLETED],
      })
      .andWhere('COALESCE(trip.booked_at, trip.created_at) >= :startOfMonth', {
        startOfMonth,
      })
      .getRawMany<{ travellers: string | null }>();

    const travellerCount = trips.reduce((total, trip) => {
      const match = trip.travellers?.match(/\d+/);
      return total + (match ? Number(match[0]) : 1);
    }, 0);

    return { bookingCount: trips.length, travellerCount };
  }

  async updateStatus(id: string, status: TripStatus) {
    const trip = await this.repo.findOne({ where: { id } });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    if (
      !trip.bookedAt &&
      (status === TripStatus.CONFIRMED || status === TripStatus.COMPLETED)
    ) {
      trip.bookedAt = new Date();
    }
    trip.status = status;
    return this.repo.save(trip);
  }
}

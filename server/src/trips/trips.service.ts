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

  async updateStatus(id: string, status: TripStatus) {
    const trip = await this.repo.findOne({ where: { id } });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    trip.status = status;
    return this.repo.save(trip);
  }
}

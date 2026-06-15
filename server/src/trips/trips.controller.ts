import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripStatus } from './entities/trip.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('trips')
export class TripsController {
  constructor(private readonly svc: TripsService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  create(@Body() dto: CreateTripDto) {
    return this.svc.create(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TripStatus,
  ) {
    return this.svc.updateStatus(id, status);
  }
}

import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Post()
  upsert(@Body() dto: CreateUserDto) {
    return this.svc.upsert(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('activity/package/:packageId')
  trackPackageView(
    @Param('packageId', ParseUUIDPipe) packageId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.svc.trackPackageView(req.user.id, packageId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { id: string; isAdmin?: boolean } },
  ) {
    if (req.user.id !== id && !req.user.isAdmin) {
      throw new ForbiddenException('You cannot view another user');
    }
    return this.svc.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.svc.findAllWithActivity();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/admin')
  setAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isAdmin') isAdmin: boolean,
  ) {
    return this.svc.setAdmin(id, isAdmin);
  }
}

import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.svc.findAll();
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

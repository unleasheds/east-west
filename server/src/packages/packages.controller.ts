import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('packages')
export class PackagesController {
  constructor(private readonly svc: PackagesService) {}

  @Get()
  findAll(@Query('type') type?: string, @Query('destination') destination?: string) {
    return this.svc.findAll({ type, destination });
  }

  /** Admin: all packages including inactive */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  findAllAdmin() {
    return this.svc.findAllAdmin();
  }

  /** Must come BEFORE :id to avoid 'slug' being parsed as UUID */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreatePackageDto) {
    return this.svc.create(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePackageDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}

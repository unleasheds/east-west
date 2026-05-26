import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly svc: WishlistService) {}

  @Get(':userId')
  getByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.svc.getByUser(userId);
  }

  @Post()
  save(@Body() dto: CreateWishlistDto) {
    return this.svc.save(dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}

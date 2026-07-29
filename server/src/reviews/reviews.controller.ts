import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('package/:packageId')
  findForPackage(@Param('packageId', ParseUUIDPipe) packageId: string) {
    return this.reviews.findForPackage(packageId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('package/:packageId')
  create(
    @Param('packageId', ParseUUIDPipe) packageId: string,
    @Request() req: { user: { id: string } },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviews.create(packageId, req.user.id, dto);
  }
}

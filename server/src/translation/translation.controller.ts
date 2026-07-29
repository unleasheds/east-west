import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { TranslationService } from './translation.service';

class ItineraryDayDto {
  @Type(() => Number)
  day: number;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  activities: string[];
}

class TranslateDto {
  @IsIn(['ms', 'ar'])
  locale: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  highlights?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItineraryDayDto)
  @IsOptional()
  itinerary?: ItineraryDayDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  included?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excluded?: string[];
}

/** Admin-only: drafts a translation for review. Never writes to the database. */
@Controller('translation')
export class TranslationController {
  constructor(private readonly translation: TranslationService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('package')
  translatePackage(@Body() dto: TranslateDto) {
    const { locale, ...content } = dto;
    return this.translation.translatePackage(content, locale);
  }
}

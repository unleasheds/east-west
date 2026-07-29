import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ItineraryDayDto {
  @IsNumber()
  day: number;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  activities: string[];
}

/** Per-locale overrides; every field optional so partial translations are valid. */
class PackageTranslationDto {
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

/**
 * Locales are listed explicitly rather than as an open record: the global
 * ValidationPipe runs with `forbidNonWhitelisted`, so an open map would reject
 * every payload. Adding a language means adding a field here.
 */
class PackageTranslationsDto {
  @ValidateNested()
  @Type(() => PackageTranslationDto)
  @IsOptional()
  ms?: PackageTranslationDto;

  @ValidateNested()
  @Type(() => PackageTranslationDto)
  @IsOptional()
  ar?: PackageTranslationDto;
}

export class CreatePackageDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsString()
  destination: string;

  @IsString()
  location: string;

  @IsString()
  duration: string;

  @IsString()
  price: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priceValue?: number;

  @IsString()
  @IsOptional()
  childPrice?: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  imageGradient: string;

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

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsNumber()
  @IsOptional()
  reviewCount?: number;

  @IsBoolean()
  @IsOptional()
  isHalalCertified?: boolean;

  @ValidateNested()
  @Type(() => PackageTranslationsDto)
  @IsOptional()
  translations?: PackageTranslationsDto;
}

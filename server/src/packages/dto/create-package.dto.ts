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
}

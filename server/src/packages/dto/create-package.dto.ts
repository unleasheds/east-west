import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PackageType } from '../entities/package.entity';

export class CreatePackageDto {
  @IsString()
  title: string;

  @IsEnum(PackageType)
  type: PackageType;

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
  description: string;

  @IsString()
  imageGradient: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  highlights?: string[];

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

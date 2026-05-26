import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsInt()
  @Min(50)
  amount: number; // cents

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, string>;
}

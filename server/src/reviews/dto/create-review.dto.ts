import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @Length(3, 2000)
  comment: string;
}

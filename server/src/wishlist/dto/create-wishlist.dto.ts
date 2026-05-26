import { IsUUID } from 'class-validator';

export class CreateWishlistDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  packageId: string;
}

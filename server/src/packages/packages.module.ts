import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { PackageImagesService } from './package-images.service';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [TypeOrmModule.forFeature([Package]), ReviewsModule],
  providers: [PackagesService, PackageImagesService],
  controllers: [PackagesController],
  exports: [PackagesService],
})
export class PackagesModule {}

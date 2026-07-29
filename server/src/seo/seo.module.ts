import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from '../packages/entities/package.entity';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Package])],
  controllers: [SeoController],
  providers: [SeoService],
  exports: [SeoService],
})
export class SeoModule {}

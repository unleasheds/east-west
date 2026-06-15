import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Package } from '../packages/entities/package.entity';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Package]), SettingsModule],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}

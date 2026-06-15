import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesModule } from './packages/packages.module';
import { TripsModule } from './trips/trips.module';
import { UsersModule } from './users/users.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { SeedModule } from './seed/seed.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './settings/settings.module';
import { Package } from './packages/entities/package.entity';
import { Trip } from './trips/entities/trip.entity';
import { User } from './users/entities/user.entity';
import { Wishlist } from './wishlist/entities/wishlist.entity';
import { AppSetting } from './settings/entities/app-setting.entity';

@Module({
  imports: [
    // Load .env
    ConfigModule.forRoot({ isGlobal: true }),

    // PostgreSQL via TypeORM — supports Railway's DATABASE_URL or individual vars
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const base = {
          type: 'postgres' as const,
          entities: [Package, Trip, User, Wishlist, AppSetting],
          synchronize: config.get<string>('NODE_ENV') !== 'production',
          logging: config.get<string>('NODE_ENV') === 'development',
          ssl: databaseUrl ? { rejectUnauthorized: false } : false,
        };
        if (databaseUrl) {
          return { ...base, url: databaseUrl };
        }
        return {
          ...base,
          host:     config.get<string>('DB_HOST', 'localhost'),
          port:     config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', ''),
          database: config.get<string>('DB_DATABASE', 'eastwest_db'),
        };
      },
    }),

    PackagesModule,
    TripsModule,
    UsersModule,
    WishlistModule,
    SeedModule,
    PaymentsModule,
    AuthModule,
    SettingsModule,
  ],
})
export class AppModule {}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Locales the package copy can be translated into. English is the source. */
export type PackageLocale = 'ms' | 'ar';

/** Translatable subset of a package. Every field is optional — see `translations`. */
export interface PackageTranslation {
  title?: string;
  location?: string;
  duration?: string;
  description?: string;
  highlights?: string[];
  itinerary?: { day: number; title: string; activities: string[] }[];
  included?: string[];
  excluded?: string[];
}

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** URL-friendly slug, e.g. 'himmafushi-7d' */
  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  /** Free-text type managed via app_settings (package_types key) */
  @Column({ default: 'Family' })
  type: string;

  @Column()
  destination: string;

  @Column()
  location: string;

  @Column()
  duration: string;

  @Column()
  price: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceValue: number;

  @Column({ nullable: true, name: 'child_price' })
  childPrice: string;

  @Column('text')
  description: string;

  /** Ordered array of image URLs (CDN / R2) */
  @Column({ type: 'simple-json', default: '[]' })
  images: string[];

  @Column({ type: 'text', name: 'image_gradient' })
  imageGradient: string;

  @Column({ type: 'simple-json', default: '[]' })
  highlights: string[];

  /** [{day, title, activities:[]}] */
  @Column({ type: 'simple-json', default: '[]' })
  itinerary: { day: number; title: string; activities: string[] }[];

  @Column({ type: 'simple-json', default: '[]' })
  included: string[];

  @Column({ type: 'simple-json', default: '[]', nullable: true })
  excluded: string[];

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 5.0 })
  rating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  /**
   * Per-locale overrides of the customer-facing text, keyed by locale
   * ('ms', 'ar'). Any field left blank falls back to the English column above,
   * so a partially translated package still renders coherently.
   *
   * The columns above remain the English source of truth — translations are
   * additive, never a replacement.
   */
  @Column({ type: 'simple-json', default: '{}' })
  translations: Partial<Record<PackageLocale, PackageTranslation>>;

  @Column({ name: 'is_halal_certified', default: true })
  isHalalCertified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

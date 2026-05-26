import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PackageType {
  FAMILY    = 'Family',
  PRIVATE   = 'Private',
  HONEYMOON = 'Honeymoon',
  RAMADAN   = 'Ramadan',
  ISLAND    = 'Island',
  CITY      = 'City',
}

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: PackageType })
  type: PackageType;

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

  @Column('text')
  description: string;

  @Column({ type: 'text', name: 'image_gradient' })
  imageGradient: string;

  @Column({ type: 'simple-array', default: '' })
  highlights: string[];

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 5.0 })
  rating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ name: 'is_halal_certified', default: true })
  isHalalCertified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

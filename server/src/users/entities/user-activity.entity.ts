import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_activities')
@Index(['userId', 'packageId'], { unique: true })
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'package_id' })
  packageId: string;

  @Column({ name: 'view_count', default: 1 })
  viewCount: number;

  @Column({ name: 'last_viewed_at', type: 'timestamp' })
  lastViewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

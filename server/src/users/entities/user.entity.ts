import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, unique: true })
  email: string;

  /** Google OAuth sub (subject) — unique across Google accounts */
  @Column({ name: 'google_id', nullable: true, unique: true })
  googleId: string;

  /** Profile picture URL from Google */
  @Column({ nullable: true })
  avatar: string;

  @Column({ name: 'family_size', nullable: true })
  familySize: string;

  @Column({ name: 'preferred_budget', nullable: true })
  budget: string;

  @Column({ type: 'text', nullable: true })
  preferences: string;

  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

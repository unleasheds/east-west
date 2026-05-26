import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TripStatus {
  PENDING   = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
}

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  packageId: string;

  @Column({ nullable: true })
  destination: string;

  @Column({ nullable: true })
  dates: string;

  @Column({ nullable: true })
  travellers: string;

  @Column({ nullable: true })
  budget: string;

  @Column({ type: 'text', nullable: true })
  needs: string;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.PENDING })
  status: TripStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

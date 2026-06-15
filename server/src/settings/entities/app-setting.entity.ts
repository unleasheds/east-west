import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/** Generic key→string[] store for admin-managed lists */
@Entity('app_settings')
export class AppSetting {
  @PrimaryColumn()
  key: string;

  /** JSON array — strings for most keys, {label,iconName}[] for categories */
  @Column({ type: 'simple-json', default: '[]' })
  values: unknown[];

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

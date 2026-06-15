import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from './entities/app-setting.entity';

export const SETTING_KEYS = {
  PACKAGE_TYPES:  'package_types',
  DESTINATIONS:   'destinations',
  CATEGORIES:     'categories',
} as const;

const DEFAULTS: Record<string, unknown[]> = {
  [SETTING_KEYS.PACKAGE_TYPES]: ['Family', 'Private', 'Honeymoon', 'Ramadan', 'Island', 'City'],
  [SETTING_KEYS.DESTINATIONS]:  ['Maldives', 'Malaysia', 'Indonesia', 'Dubai', 'Turkey', 'Morocco'],
  [SETTING_KEYS.CATEGORIES]: [
    { label: 'All',      iconName: 'Globe'    },
    { label: 'Maldives', iconName: 'Waves'    },
    { label: 'Malaysia', iconName: 'TreePalm' },
    { label: 'Family',   iconName: 'Users'    },
    { label: 'Island',   iconName: 'Anchor'   },
  ],
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSetting)
    private readonly repo: Repository<AppSetting>,
  ) {}

  async getAll(): Promise<Record<string, unknown[]>> {
    const rows = await this.repo.find();
    const result: Record<string, unknown[]> = {};
    for (const row of rows) result[row.key] = row.values;
    return result;
  }

  async get(key: string): Promise<unknown[]> {
    const row = await this.repo.findOne({ where: { key } });
    return row?.values ?? DEFAULTS[key] ?? [];
  }

  async set(key: string, values: unknown[]): Promise<AppSetting> {
    let row = await this.repo.findOne({ where: { key } });
    if (!row) {
      row = this.repo.create({ key, values });
    } else {
      row.values = values;
    }
    return this.repo.save(row);
  }

  async addItem(key: string, item: string): Promise<AppSetting> {
    const current = (await this.get(key)) as string[];
    const trimmed = item.trim();
    if (!trimmed || current.includes(trimmed)) return this.repo.findOne({ where: { key } }) as Promise<AppSetting>;
    return this.set(key, [...current, trimmed]);
  }

  async removeItem(key: string, item: string): Promise<AppSetting> {
    const current = (await this.get(key)) as string[];
    return this.set(key, current.filter((v) => v !== item));
  }

  async renameItem(key: string, oldValue: string, newValue: string): Promise<AppSetting> {
    const current = (await this.get(key)) as string[];
    return this.set(key, current.map((v) => (v === oldValue ? newValue.trim() : v)));
  }

  async seedDefaults() {
    for (const [key, values] of Object.entries(DEFAULTS)) {
      const exists = await this.repo.findOne({ where: { key } });
      if (!exists) {
        await this.repo.save(this.repo.create({ key, values }));
      } else if (key === SETTING_KEYS.CATEGORIES) {
        // Always overwrite categories so icon format stays current
        await this.repo.save({ ...exists, values });
      }
    }
  }
}

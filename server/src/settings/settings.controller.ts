import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly svc: SettingsService) {}

  /** Public: get all settings (used by package form dropdowns) */
  @Get()
  getAll() {
    return this.svc.getAll();
  }

  @Get(':key')
  get(@Param('key') key: string) {
    return this.svc.get(key).then((values) => ({ key, values }));
  }

  /** Admin: replace entire list */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':key')
  set(@Param('key') key: string, @Body('values') values: unknown[]) {
    return this.svc.set(key, values);
  }

  /** Admin: add one item */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':key/items')
  addItem(@Param('key') key: string, @Body('value') value: string) {
    return this.svc.addItem(key, value);
  }

  /** Admin: delete one item */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':key/items/:item')
  removeItem(@Param('key') key: string, @Param('item') item: string) {
    return this.svc.removeItem(key, item);
  }

  /** Admin: rename one item */
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':key/items/:item')
  renameItem(
    @Param('key') key: string,
    @Param('item') item: string,
    @Body('value') value: string,
  ) {
    return this.svc.renameItem(key, item, value);
  }
}

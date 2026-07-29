import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SeoService } from './seo.service';

/**
 * Crawler-facing resources. These live behind the `/api` prefix; the edge
 * server in front of the SPA re-publishes them at the site root
 * (`/robots.txt`, `/sitemap.xml`, …) where crawlers actually look for them.
 */
@Controller('seo')
export class SeoController {
  constructor(private readonly seo: SeoService) {}

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  robots(): string {
    return this.seo.buildRobotsTxt();
  }

  @Get('sitemap.xml')
  async sitemapIndex(@Res() res: Response): Promise<void> {
    sendXml(res, await this.seo.buildSitemapIndex());
  }

  @Get('sitemap-pages.xml')
  sitemapPages(@Res() res: Response): void {
    sendXml(res, this.seo.buildPagesSitemap());
  }

  @Get('sitemap-packages.xml')
  async sitemapPackages(@Res() res: Response): Promise<void> {
    sendXml(res, await this.seo.buildPackagesSitemap());
  }

}

function sendXml(res: Response, xml: string): void {
  res
    .status(200)
    .set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
    })
    .send(xml);
}

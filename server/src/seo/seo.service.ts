import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../packages/entities/package.entity';

/** Languages the interface is served in; each becomes an `xhtml:link` alternate. */
const LOCALES = ['en', 'ms', 'ar'] as const;

/** Static, indexable routes. Private routes are deliberately absent. */
const STATIC_ROUTES: { path: string; changefreq: string; priority: number }[] = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  // The contact page carries the business's name/address/phone data.
  { path: '/contact', changefreq: 'monthly', priority: 0.6 },
];

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq: string;
  priority: number;
  images?: { loc: string; title?: string }[];
}

@Injectable()
export class SeoService {
  constructor(
    @InjectRepository(Package)
    private readonly packages: Repository<Package>,
  ) {}

  /** Canonical public origin — configurable so staging never advertises production URLs. */
  private get origin(): string {
    return (process.env.PUBLIC_SITE_URL ?? 'https://eastwesthalaltravel.com').replace(/\/$/, '');
  }

  /** Whether this deployment is allowed to be crawled at all. */
  private get indexable(): boolean {
    return process.env.SEO_ALLOW_INDEXING !== 'false';
  }

  // ── robots.txt ────────────────────────────────────────────────────────────

  buildRobotsTxt(): string {
    if (!this.indexable) {
      return ['User-agent: *', 'Disallow: /', ''].join('\n');
    }

    return [
      'User-agent: *',
      'Allow: /',
      '',
      '# Private, transactional and administrative areas',
      'Disallow: /admin',
      'Disallow: /profile',
      'Disallow: /wishlist',
      'Disallow: /trips',
      '',
      '# Crawlers should not spend budget on the API',
      'Disallow: /api/',
      '',
      '# Ad crawlers need access for landing-page quality scoring',
      'User-agent: AdsBot-Google',
      'Allow: /',
      '',
      'User-agent: Googlebot-Image',
      'Allow: /',
      '',
      `Sitemap: ${this.origin}/sitemap.xml`,
      '',
    ].join('\n');
  }

  // ── Sitemaps ──────────────────────────────────────────────────────────────

  /** Sitemap index pointing at the page and package sitemaps. */
  async buildSitemapIndex(): Promise<string> {
    const newest = await this.packages
      .createQueryBuilder('p')
      .select('MAX(p.updated_at)', 'max')
      .where('p.is_active = :active', { active: true })
      .getRawOne<{ max: Date | null }>();

    const packagesLastmod = newest?.max ? new Date(newest.max).toISOString() : undefined;

    const entries = [
      { loc: `${this.origin}/sitemap-pages.xml`, lastmod: undefined },
      { loc: `${this.origin}/sitemap-packages.xml`, lastmod: packagesLastmod },
    ];

    const body = entries
      .map(
        (entry) =>
          `  <sitemap>\n    <loc>${escapeXml(entry.loc)}</loc>${
            entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''
          }\n  </sitemap>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
  }

  buildPagesSitemap(): string {
    return this.renderUrlSet(
      STATIC_ROUTES.map((route) => ({
        path: route.path,
        changefreq: route.changefreq,
        priority: route.priority,
      })),
    );
  }

  async buildPackagesSitemap(): Promise<string> {
    const rows = await this.packages.find({
      where: { isActive: true },
      order: { updatedAt: 'DESC' },
    });

    const entries: SitemapEntry[] = rows.map((pkg) => ({
      path: `/package/${pkg.slug ?? pkg.id}`,
      lastmod: pkg.updatedAt ? new Date(pkg.updatedAt).toISOString() : undefined,
      changefreq: 'weekly',
      priority: 0.8,
      images: (Array.isArray(pkg.images) ? pkg.images : [])
        .filter(Boolean)
        .slice(0, 20) // Google caps image entries per URL
        .map((loc) => ({ loc, title: pkg.title })),
    }));

    return this.renderUrlSet(entries);
  }

  private renderUrlSet(entries: SitemapEntry[]): string {
    const urls = entries
      .map((entry) => {
        const loc = `${this.origin}${entry.path}`;
        const lines = [`    <loc>${escapeXml(loc)}</loc>`];

        if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
        lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
        lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);

        for (const locale of LOCALES) {
          const href = locale === 'en' ? loc : `${loc}?lang=${locale}`;
          lines.push(
            `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(href)}"/>`,
          );
        }
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}"/>`,
        );

        for (const image of entry.images ?? []) {
          lines.push(
            '    <image:image>',
            `      <image:loc>${escapeXml(absolute(image.loc, this.origin))}</image:loc>`,
            ...(image.title ? [`      <image:title>${escapeXml(image.title)}</image:title>`] : []),
            '    </image:image>',
          );
        }

        return `  <url>\n${lines.join('\n')}\n  </url>`;
      })
      .join('\n');

    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
      '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n' +
      '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
      `${urls}\n</urlset>\n`
    );
  }
}

function absolute(url: string, origin: string): string {
  return /^https?:\/\//i.test(url) ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};
function escapeXml(value: string): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

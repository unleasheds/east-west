/**
 * EastWest edge server.
 *
 * Serves the built SPA and, critically for SEO, rewrites the HTML shell's
 * <head> per request so that every URL returns its own title, description,
 * canonical, hreflang set, Open Graph tags and JSON-LD — before any JavaScript
 * runs. Search engines render JS, but social and AI crawlers (WhatsApp,
 * Facebook, Slack, LinkedIn, X) do not; without this they would all see the
 * same generic shell.
 *
 * Deliberately zero-dependency: only Node built-ins.
 */

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile, readdir } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompress, gzip, constants as zlibConstants } from 'node:zlib';
import { promisify } from 'node:util';

import {
  SITE,
  canonicalPath,
  packageMeta,
  renderHeadTags,
  staticRouteMeta,
  escapeHtml,
  LOCALES,
  DEFAULT_LOCALE,
} from './shared/seo.js';

const brotliAsync = promisify(brotliCompress);
const gzipAsync = promisify(gzip);

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const DIST = resolve(process.env.STATIC_ROOT ?? join(ROOT, 'dist'));
const PORT = Number(process.env.PORT ?? 8080);
const CANONICAL_HOST = new URL(SITE.origin).host;
const API_BASE = (process.env.API_URL ?? process.env.VITE_API_URL ?? 'https://api.eastwesthalaltravel.com')
  .replace(/\/$/, '');

/** Upstream calls must never be able to hang a page render. */
const UPSTREAM_TIMEOUT_MS = Number(process.env.SEO_UPSTREAM_TIMEOUT_MS ?? 2500);
const PACKAGE_TTL_MS = 5 * 60_000;
const SITEMAP_TTL_MS = 10 * 60_000;

// ─────────────────────────────────────────────────────────────────────────────
// Routing table — mirrors client/src/App.tsx
// ─────────────────────────────────────────────────────────────────────────────

const KNOWN_ROUTES = new Set(['/', '/contact', '/wishlist', '/trips', '/profile', '/admin']);

/** Permanent moves. `/inbox` was the contact page's original, undescriptive URL. */
const REDIRECTS = new Map([['/inbox', '/contact']]);
const PACKAGE_ROUTE = /^\/package\/([^/]+)$/;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
};

const COMPRESSIBLE = new Set([
  'text/html',
  'text/css',
  'text/javascript',
  'text/plain',
  'application/json',
  'application/xml',
  'application/manifest+json',
  'image/svg+xml',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Tiny TTL cache
// ─────────────────────────────────────────────────────────────────────────────

/** @type {Map<string, { value: unknown, expires: number }>} */
const cache = new Map();

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
}

function cacheSet(key, value, ttl) {
  // Bounded so a crawler walking unknown slugs cannot grow this without limit.
  if (cache.size > 500) cache.clear();
  cache.set(key, { value, expires: Date.now() + ttl });
  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// Upstream API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {{ ok: true, data: any } | { ok: false, reason: 'missing' | 'unavailable' }} UpstreamResult
 * `missing` means the API answered 404 — authoritative. `unavailable` means we
 * could not reach it, which must never be mistaken for "this page is gone".
 * @returns {Promise<UpstreamResult>}
 */
async function fetchUpstream(path, { asText = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: { Accept: asText ? 'text/plain, application/xml' : 'application/json' },
    });
    if (response.status === 404 || response.status === 410) {
      return { ok: false, reason: 'missing' };
    }
    if (!response.ok) return { ok: false, reason: 'unavailable' };
    return { ok: true, data: asText ? await response.text() : await response.json() };
  } catch {
    // A slow or unreachable API degrades to the generic shell, never a 5xx.
    return { ok: false, reason: 'unavailable' };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @returns {Promise<{ pkg: object|null, missing: boolean }>}
 * `missing: false` with a null package means the API was unreachable — the page
 * still renders, but we must not tell crawlers the URL is a 404.
 */
async function loadPackage(slug) {
  const key = `pkg:${slug}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;

  // Uses the long-standing packages endpoint rather than anything SEO-specific,
  // so the edge server keeps working regardless of API deploy ordering.
  const result = await fetchUpstream(`/api/packages/slug/${encodeURIComponent(slug)}`);

  if (result.ok) {
    return cacheSet(key, { pkg: result.data, missing: false }, PACKAGE_TTL_MS);
  }
  if (result.reason === 'missing') {
    // Cache negatives briefly so a crawler hammering dead slugs is cheap.
    return cacheSet(key, { pkg: null, missing: true }, PACKAGE_TTL_MS);
  }
  return { pkg: null, missing: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML shell
// ─────────────────────────────────────────────────────────────────────────────

const HEAD_PLACEHOLDER = '<!--seo:head-->';
const BODY_PLACEHOLDER = '<!--seo:body-->';

let shellCache = null;
async function loadShell() {
  if (shellCache) return shellCache;
  const html = await readFile(join(DIST, 'index.html'), 'utf8');
  shellCache = html;
  return html;
}

/**
 * Crawler-visible fallback copy. Rendered inside <noscript>, so it never
 * affects layout for real users but is still read by non-rendering crawlers.
 */
function renderNoscript(meta, pkg) {
  const parts = [`<h1>${escapeHtml(pkg ? pkg.title : SITE.name)}</h1>`];
  parts.push(`<p>${escapeHtml(meta.description)}</p>`);

  if (pkg) {
    parts.push(
      `<p>${escapeHtml(
        [pkg.duration, `${pkg.location}, ${pkg.destination}`, pkg.price ? `from ${pkg.price}` : '']
          .filter(Boolean)
          .join(' · '),
      )}</p>`,
    );
    const highlights = Array.isArray(pkg.highlights) ? pkg.highlights.slice(0, 8) : [];
    if (highlights.length > 0) {
      parts.push(
        `<h2>Trip highlights</h2><ul>${highlights
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join('')}</ul>`,
      );
    }
    const itinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary.slice(0, 14) : [];
    if (itinerary.length > 0) {
      parts.push(
        `<h2>Itinerary</h2><ol>${itinerary
          .map((day) => `<li>${escapeHtml(day.title ?? `Day ${day.day}`)}</li>`)
          .join('')}</ol>`,
      );
    }
    parts.push(`<p><a href="${SITE.origin}/">All halal holiday packages</a></p>`);
  } else {
    parts.push(
      `<p>${escapeHtml(SITE.tagline)}. Contact us at ` +
        `<a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`,
    );
  }

  return `<noscript>${parts.join('')}</noscript>`;
}

/** Builds the final HTML for a request path. */
async function renderPage(pathname, searchParams) {
  const path = canonicalPath(pathname);
  const localeParam = searchParams.get('lang');
  const locale = LOCALES.includes(localeParam) ? localeParam : DEFAULT_LOCALE;

  let meta;
  let pkg = null;
  let status = 200;

  const packageMatch = PACKAGE_ROUTE.exec(path);
  if (packageMatch) {
    const result = await loadPackage(decodeURIComponent(packageMatch[1]));
    pkg = result.pkg;
    if (pkg) {
      meta = packageMeta(pkg);
    } else if (result.missing) {
      meta = staticRouteMeta('/__not-found');
      status = 404;
    } else {
      // The API is unreachable. The SPA still renders and can retry, but the
      // response must say "retry later" rather than "this page is gone" —
      // a 404 here would deindex live packages during an outage.
      meta = {
        title: `Halal Holiday Package | ${SITE.name}`,
        description: SITE.tagline,
        path,
        noindex: true,
        type: 'website',
        image: SITE.defaultImage,
        jsonLd: [],
      };
      status = 503;
    }
  } else if (KNOWN_ROUTES.has(path)) {
    meta = staticRouteMeta(path);
  } else {
    meta = staticRouteMeta('/__not-found');
    status = 404;
  }

  meta = { ...meta, locale };

  const shell = await loadShell();
  const html = shell
    .replace(HEAD_PLACEHOLDER, renderHeadTags(meta))
    .replace(BODY_PLACEHOLDER, renderNoscript(meta, pkg))
    .replace('<html lang="en"', `<html lang="${locale}"${locale === 'ar' ? ' dir="rtl"' : ''}`);

  return { html, status };
}

// ─────────────────────────────────────────────────────────────────────────────
// robots.txt & sitemaps — republished at the site root from the API
// ─────────────────────────────────────────────────────────────────────────────

const SITEMAP_PATHS = new Set(['/sitemap.xml', '/sitemap-pages.xml', '/sitemap-packages.xml']);

const FALLBACK_ROBOTS = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin',
  'Disallow: /profile',
  'Disallow: /wishlist',
  'Disallow: /trips',
  '',
  `Sitemap: ${SITE.origin}/sitemap.xml`,
  '',
].join('\n');

/** Fetches a text resource from the API, memoised, with a caller-supplied fallback. */
async function cachedUpstreamText(key, path) {
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;

  const result = await fetchUpstream(path, { asText: true });
  if (!result.ok) return null;
  return cacheSet(key, result.data, SITEMAP_TTL_MS);
}

async function serveRobots(req, res) {
  // robots.txt must always answer — an unreachable API returning 5xx here can
  // make Google treat the whole site as disallowed.
  const body = (await cachedUpstreamText('robots', '/api/seo/robots.txt')) ?? FALLBACK_ROBOTS;
  await send(req, res, 200, body, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  });
}

async function serveSitemap(req, res, pathname) {
  const body = await cachedUpstreamText(`sitemap:${pathname}`, `/api/seo${pathname}`);

  if (!body) {
    await send(req, res, 503, 'Sitemap temporarily unavailable', {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': '120',
    });
    return;
  }

  await send(req, res, 200, body, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=1800',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Static assets
// ─────────────────────────────────────────────────────────────────────────────

/** Files emitted by Vite with a content hash can be cached forever. */
function cacheControlFor(pathname) {
  if (pathname.startsWith('/assets/')) return 'public, max-age=31536000, immutable';
  if (pathname === '/sw.js') return 'public, max-age=0, must-revalidate';
  if (pathname === '/manifest.webmanifest') return 'public, max-age=3600';
  return 'public, max-age=86400';
}

/** Resolves a URL path to a file inside DIST, refusing anything that escapes it. */
function resolveStatic(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded.includes('\0')) return null;
  const target = resolve(join(DIST, normalize(decoded)));
  if (target !== DIST && !target.startsWith(DIST + sep)) return null;
  return target;
}

async function serveStatic(req, res, pathname) {
  const filePath = resolveStatic(pathname);
  if (!filePath) return false;

  let stats;
  try {
    stats = await stat(filePath);
  } catch {
    return false;
  }
  if (!stats.isFile()) return false;

  const type = MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
  const etag = `W/"${stats.size.toString(16)}-${stats.mtimeMs.toString(16)}"`;

  const headers = {
    'Content-Type': type,
    'Cache-Control': cacheControlFor(pathname),
    ETag: etag,
    'Last-Modified': stats.mtime.toUTCString(),
    Vary: 'Accept-Encoding',
  };

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, headers);
    res.end();
    return true;
  }

  const baseType = type.split(';')[0];
  // Compress text assets; leave already-compressed binaries alone.
  if (COMPRESSIBLE.has(baseType) && stats.size > 512) {
    const encoding = negotiateEncoding(req);
    if (encoding) {
      const key = `static:${filePath}:${etag}:${encoding}`;
      let body = cacheGet(key);
      if (!body) {
        const raw = await readFile(filePath);
        body = await compress(raw, encoding);
        cacheSet(key, body, 60 * 60_000);
      }
      res.writeHead(200, {
        ...headers,
        'Content-Encoding': encoding,
        'Content-Length': body.length,
      });
      res.end(req.method === 'HEAD' ? undefined : body);
      return true;
    }
  }

  res.writeHead(200, { ...headers, 'Content-Length': stats.size });
  if (req.method === 'HEAD') {
    res.end();
  } else {
    createReadStream(filePath).pipe(res);
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Response helpers
// ─────────────────────────────────────────────────────────────────────────────

function negotiateEncoding(req) {
  const accepted = String(req.headers['accept-encoding'] ?? '');
  if (/\bbr\b/.test(accepted)) return 'br';
  if (/\bgzip\b/.test(accepted)) return 'gzip';
  return null;
}

function compress(buffer, encoding) {
  return encoding === 'br'
    ? brotliAsync(buffer, {
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: 5,
          [zlibConstants.BROTLI_PARAM_SIZE_HINT]: buffer.length,
        },
      })
    : gzipAsync(buffer, { level: 6 });
}

async function send(req, res, status, body, headers = {}) {
  const buffer = Buffer.isBuffer(body) ? body : Buffer.from(String(body), 'utf8');
  const baseType = String(headers['Content-Type'] ?? '').split(';')[0];
  const encoding = COMPRESSIBLE.has(baseType) && buffer.length > 512 ? negotiateEncoding(req) : null;

  const finalHeaders = { ...headers, Vary: 'Accept-Encoding' };
  let payload = buffer;

  if (encoding) {
    payload = await compress(buffer, encoding);
    finalHeaders['Content-Encoding'] = encoding;
  }
  finalHeaders['Content-Length'] = payload.length;

  res.writeHead(status, finalHeaders);
  res.end(req.method === 'HEAD' ? undefined : payload);
}

/** Security headers. `Strict-Transport-Security` is only safe once TLS is terminated upstream. */
function baseSecurityHeaders(isHttps) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    ...(isHttps ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' } : {}),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Request handler
// ─────────────────────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Length': 0 });
      res.end();
      return;
    }

    const forwardedProto = String(req.headers['x-forwarded-proto'] ?? '').split(',')[0].trim();
    const isHttps = forwardedProto === 'https';
    const host = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? CANONICAL_HOST)
      .split(',')[0]
      .trim();

    const url = new URL(req.url ?? '/', `${isHttps ? 'https' : 'http'}://${host}`);
    const pathname = url.pathname;

    for (const [key, value] of Object.entries(baseSecurityHeaders(isHttps))) {
      res.setHeader(key, value);
    }

    if (pathname === '/healthz') {
      await send(req, res, 200, 'ok', {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      return;
    }

    // ── Canonical host: fold www and any Railway alias onto the apex domain.
    // One 301 keeps link equity on a single hostname.
    const isCanonicalHost = host === CANONICAL_HOST;
    const isInternalHost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
    if (process.env.CANONICAL_REDIRECT !== 'false' && !isCanonicalHost && !isInternalHost) {
      res.writeHead(301, {
        Location: `${SITE.origin}${req.url ?? '/'}`,
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': 0,
      });
      res.end();
      return;
    }

    // ── Retired URLs. A 301 passes the accumulated ranking signal to the new
    // location instead of stranding it on a dead path.
    const movedTo = REDIRECTS.get(pathname);
    if (movedTo) {
      res.writeHead(301, {
        Location: `${movedTo}${url.search}`,
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': 0,
      });
      res.end();
      return;
    }

    // ── Collapse trailing slashes so /package/x/ and /package/x are one URL.
    if (pathname.length > 1 && pathname.endsWith('/')) {
      res.writeHead(301, {
        Location: `${pathname.replace(/\/+$/, '')}${url.search}`,
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': 0,
      });
      res.end();
      return;
    }

    if (pathname === '/robots.txt') {
      await serveRobots(req, res);
      return;
    }
    if (SITEMAP_PATHS.has(pathname)) {
      await serveSitemap(req, res, pathname);
      return;
    }

    // Static files first — but never let a stray dist/404.html or index.html
    // be served directly, since those bypass head injection.
    if (pathname !== '/index.html' && pathname !== '/404.html' && extname(pathname) !== '') {
      if (await serveStatic(req, res, pathname)) return;
    }

    const { html, status } = await renderPage(pathname, url.searchParams);
    await send(req, res, status, html, {
      'Content-Type': 'text/html; charset=utf-8',
      // The shell is cheap to regenerate and its head is URL-specific;
      // revalidating keeps meta fresh after a package edit.
      'Cache-Control': 'public, max-age=0, must-revalidate',
    });
  } catch (error) {
    console.error('[edge] request failed', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`🌍 EastWest edge server on :${PORT}`);
  console.log(`   static root : ${DIST}`);
  console.log(`   api base    : ${API_BASE}`);
  console.log(`   canonical   : ${SITE.origin}`);
  readdir(DIST).catch(() => {
    console.warn(`⚠️  static root ${DIST} is not readable — did the build run?`);
  });
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}

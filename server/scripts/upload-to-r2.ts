/**
 * upload-to-r2.ts
 *
 * Downloads all package images from eastwesthalaltravel.com and uploads
 * them to a Cloudflare R2 bucket. After running, copy the printed
 * JSON block into seed.service.ts to replace the WordPress URLs.
 *
 * Prerequisites:
 *   1. Set env vars (or copy .env.example → .env and fill in):
 *        R2_ACCOUNT_ID   — Cloudflare account ID
 *        R2_ACCESS_KEY   — R2 Access Key ID
 *        R2_SECRET_KEY   — R2 Secret Access Key
 *        R2_BUCKET       — Bucket name (e.g. eastwest-media)
 *        R2_PUBLIC_URL   — Public bucket URL (e.g. https://media.yourdomain.com)
 *
 *   2. Run:
 *        npx ts-node -r tsconfig-paths/register scripts/upload-to-r2.ts
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as https from 'https';
import * as http from 'http';

const R2_ACCOUNT_ID  = process.env.R2_ACCOUNT_ID  ?? '';
const R2_ACCESS_KEY  = process.env.R2_ACCESS_KEY   ?? '';
const R2_SECRET_KEY  = process.env.R2_SECRET_KEY   ?? '';
const R2_BUCKET      = process.env.R2_BUCKET       ?? 'eastwest-media';
const R2_PUBLIC_URL  = (process.env.R2_PUBLIC_URL  ?? '').replace(/\/$/, '');

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY || !R2_SECRET_KEY) {
  console.error('Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY env vars.');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
});

/** Download a URL and return Buffer + content-type */
function download(url: string): Promise<{ body: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(download(res.headers.location!));
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () =>
        resolve({
          body: Buffer.concat(chunks),
          contentType: res.headers['content-type'] ?? 'image/jpeg',
        }),
      );
      res.on('error', reject);
    }).on('error', reject);
  });
}

function extFromUrl(url: string): string {
  const p = new URL(url).pathname;
  const m = p.match(/\.(jpe?g|png|webp|gif)(\?|$)/i);
  return m ? `.${m[1].toLowerCase()}` : '.jpg';
}

// ── All image URLs grouped by package slug ──────────────────────────────────
const PACKAGE_IMAGES: Record<string, string[]> = {
  'kuala-lumpur-family': [
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/DJI_20250221161932_0026_D-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/DJI_20250221162017_0027_D-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/DJI_20250221161900_0024_D-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/DJI_20250221161859_0023_D-scaled.jpg',
  ],
  'himmafushi-7d': [
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2025/10/071F8C38-0A37-47B4-A072-E4A700BCF2A7-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/photo_2025-04-10_16-40-22.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/20250130_195340-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/20250130_195333-scaled.jpg',
  ],
  'himmafushi-4d': [
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/photo_2025-04-10_16-40-22.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2025/10/071F8C38-0A37-47B4-A072-E4A700BCF2A7-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/20250130_195340-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/20250130_195333-scaled.jpg',
  ],
  'ukulhas-7d': [
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2025/10/071F8C38-0A37-47B4-A072-E4A700BCF2A7-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/photo_2025-04-10_16-40-22.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/20250130_195340-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/20250130_195333-scaled.jpg',
  ],
  'ukulhas-5d': [
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2025/10/DJI_0482-2-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/20251102_124723-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/20251102_130251-scaled.jpg',
    'https://www.eastwesthalaltravel.com/wp-content/uploads/2026/01/20251102_130502-scaled.jpg',
  ],
};

async function main() {
  const result: Record<string, string[]> = {};

  for (const [slug, urls] of Object.entries(PACKAGE_IMAGES)) {
    result[slug] = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const key = `packages/${slug}/${i + 1}${extFromUrl(url)}`;
      process.stdout.write(`Uploading ${key} ...`);

      try {
        const { body, contentType } = await download(url);
        await s3.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable',
          }),
        );
        const r2Url = `${R2_PUBLIC_URL}/${key}`;
        result[slug].push(r2Url);
        console.log(' ✓');
      } catch (err) {
        console.log(` ✗ (${(err as Error).message})`);
        result[slug].push(url); // keep original on failure
      }
    }
  }

  console.log('\n\n── R2 image map (copy into seed.service.ts) ──\n');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);

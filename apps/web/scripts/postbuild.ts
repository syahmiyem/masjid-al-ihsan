// Writes robots.txt and Cloudflare _headers into dist/ after `astro build`.
// While UAT_MODE is on (the default), the whole site is noindex (plan 6.5, D-08).

import { rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveSiteUrl } from '../site-url.mjs';

const dist = join(import.meta.dirname, '..', 'dist');
const uat = (process.env.UAT_MODE ?? 'true').toLowerCase() !== 'false';
const site = resolveSiteUrl();

const robots = uat
  ? 'User-agent: *\nDisallow: /\n'
  : `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap-index.xml\n`;

const headers = [
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
  ...(uat ? ['  X-Robots-Tag: noindex, nofollow'] : []),
  '',
  '/_astro/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
].join('\n');

// The design-system showcase is for UAT review only (plan Phase 1).
if (!uat) rmSync(join(dist, 'reka-bentuk'), { recursive: true, force: true });

writeFileSync(join(dist, 'robots.txt'), robots);
writeFileSync(join(dist, '_headers'), headers);
console.log(`postbuild: UAT_MODE=${uat} → robots.txt ${uat ? 'Disallow: /' : 'Allow: /'}; _headers written`);

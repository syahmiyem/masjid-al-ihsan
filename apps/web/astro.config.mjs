// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField } from 'astro/config';
import { resolveSiteUrl } from './site-url.mjs';

// SITE_URL: the public address. UAT uses the workers.dev URL; production uses the custom domain (D-08, D-02).
// Required in Cloudflare Workers Builds; see site-url.mjs.
const site = resolveSiteUrl();

// Month pages older than 12 months stay online but leave the sitemap (plan 6.5)
const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
/** @param {string} page */
const inSitemap = (page) => {
  const { pathname } = new URL(page);
  if (pathname.startsWith('/reka-bentuk') || pathname.startsWith('/gambar/')) return false;
  const month = pathname.match(/^\/(?:aktiviti|waktu-solat)\/(\d{4}-\d{2})\/?$/)?.[1];
  return !month || month >= cutoff;
};

export default defineConfig({
  site,
  integrations: [sitemap({ filter: inSitemap })],
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'directory' },
  env: {
    schema: {
      // Test-site mode: "Laman Percubaan" banner + noindex. Defaults to ON so a missing
      // setting can never expose an unfinished site to search engines (plan 6.5, 9.6).
      UAT_MODE: envField.boolean({ context: 'server', access: 'public', default: true }),
    },
  },
});

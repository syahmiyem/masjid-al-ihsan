// @ts-check
import { defineConfig, envField } from 'astro/config';
import { resolveSiteUrl } from './site-url.mjs';

// SITE_URL: the public address. UAT uses the workers.dev URL; production uses the custom domain (D-08, D-02).
// Required in Cloudflare Workers Builds; see site-url.mjs.
const site = resolveSiteUrl();

export default defineConfig({
  site,
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

// @ts-check
import { defineConfig, envField } from 'astro/config';

// SITE_URL: the public address. UAT uses the workers.dev URL; production uses the custom domain (D-08, D-02).
// In Cloudflare Workers Builds (WORKERS_CI=1) a missing SITE_URL fails the build rather than publishing
// localhost links; set it under Settings → Build → Variables and secrets.
if (process.env.WORKERS_CI && !process.env.SITE_URL) {
  throw new Error('SITE_URL is not set. Add it as a Build variable in Cloudflare (Settings → Build).');
}
const site = process.env.SITE_URL || 'http://localhost:4321';

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

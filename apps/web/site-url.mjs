// Shared by astro.config.mjs and scripts/postbuild.ts.
// Accepts common slips in the Cloudflare dashboard (missing https://, quotes, spaces, trailing slash)
// and fails with a readable message otherwise.

/** @returns {string} normalised origin, e.g. "https://example.org" */
export function resolveSiteUrl(env = process.env) {
  const raw = env.SITE_URL;
  if (!raw) {
    if (env.WORKERS_CI) {
      throw new Error('SITE_URL is not set. Add it as a Build variable in Cloudflare (Settings → Build).');
    }
    return 'http://localhost:4321';
  }
  let value = raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim();
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  try {
    return new URL(value).origin;
  } catch {
    throw new Error(
      `SITE_URL is not a valid address: ${JSON.stringify(raw)}. ` +
        'Use e.g. https://masjid-al-ihsan.masjidalihsansps.workers.dev',
    );
  }
}

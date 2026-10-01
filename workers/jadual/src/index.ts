// Scheduler Worker (docs/plan.md D-76) — replaces the scheduled GitHub Actions.
//   00:05 MYT daily   → POST the Workers Builds deploy hook (keeps "today", notices and images current)
//   04:00 MYT Monday  → compare JAKIM e-Solat with the committed data; alert if action is needed
//   03:00 MYT Sunday  → export the Sanity dataset to the private R2 bucket (if bound)
// Alerts go to ALERT_WEBHOOK_URL (any service accepting a JSON POST with "text"/"content"), and always
// to the Worker's logs (Cloudflare → Workers → masjid-al-ihsan-jadual → Logs).
import { checkYear, type CheckResult } from './esolat.ts';

export interface Env {
  PRAYER_ZONE: string;
  SANITY_PROJECT_ID: string;
  SANITY_DATASET: string;
  DATA_BASE_URL: string;
  DEPLOY_HOOK_URL?: string; // secret
  SANITY_READ_TOKEN?: string; // secret (Viewer), needed to include private documents in backups
  ALERT_WEBHOOK_URL?: string; // secret, optional
  BACKUPS?: R2Bucket;
}

async function alert(env: Env, text: string) {
  console.warn(`ALERT: ${text}`);
  if (!env.ALERT_WEBHOOK_URL) return;
  await fetch(env.ALERT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `[Masjid Al-Ihsan] ${text}`, content: `[Masjid Al-Ihsan] ${text}` }),
  }).catch((e) => console.error('alert webhook failed', e));
}

function mytNow() {
  const d = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, date: d.toISOString().slice(0, 10) };
}

async function nightlyRebuild(env: Env) {
  if (!env.DEPLOY_HOOK_URL) return alert(env, 'Nightly rebuild skipped: DEPLOY_HOOK_URL secret is not set.');
  const res = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
  if (!res.ok) return alert(env, `Nightly rebuild failed: deploy hook returned HTTP ${res.status}.`);
  console.log('Nightly rebuild triggered');
}

export function describe(r: CheckResult): string | null {
  switch (r.state) {
    case 'same':
    case 'not-published':
      return null;
    case 'missing-in-repo':
      return `Waktu Solat ${r.year} is now published by JAKIM but not in the website yet. Run "pnpm waktu-solat:sync" and merge the pull request.`;
    case 'different':
      return `JAKIM's Waktu Solat ${r.year} differs from the website on ${r.changedDays.length} day(s) (${r.changedDays.slice(0, 5).join(', ')}${r.changedDays.length > 5 ? ', …' : ''}). Run "pnpm waktu-solat:sync" and merge.`;
    case 'error':
      return `Waktu Solat check for ${r.year} could not run: ${r.message}. The website keeps its committed data.`;
  }
}

async function prayerCheck(env: Env) {
  const { year } = mytNow();
  for (const y of [year, year + 1]) {
    const result = await checkYear(y, env.PRAYER_ZONE, env.DATA_BASE_URL);
    console.log(`e-Solat check ${y}: ${result.state}`);
    const message = describe(result);
    if (message) await alert(env, message);
  }
}

async function backup(env: Env) {
  if (!env.BACKUPS) return console.log('Backup skipped: no R2 bucket bound yet.');
  const url = `https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2025-02-19/data/export/${env.SANITY_DATASET}`;
  const res = await fetch(url, {
    headers: env.SANITY_READ_TOKEN ? { Authorization: `Bearer ${env.SANITY_READ_TOKEN}` } : {},
  });
  if (!res.ok || !res.body)
    return alert(env, `Weekly backup failed: Sanity export returned HTTP ${res.status}.`);
  const key = `sanity/${env.SANITY_DATASET}-${mytNow().date}.ndjson`;
  await env.BACKUPS.put(key, res.body, { httpMetadata: { contentType: 'application/x-ndjson' } });
  console.log(`Backup written to R2: ${key}`);
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    switch (controller.cron) {
      case '5 16 * * *':
        return ctx.waitUntil(nightlyRebuild(env));
      case '0 20 * * 0':
        return ctx.waitUntil(prayerCheck(env));
      case '0 19 * * 6':
        return ctx.waitUntil(backup(env));
      default:
        console.warn(`Unknown cron ${controller.cron}`);
    }
  },
} satisfies ExportedHandler<Env>;

// Build-time guard (runs in Workers Builds via `pnpm ci:build`).
// Fails the build if committed prayer-time data for the current year (MYT) is missing or invalid.
// A failed build leaves the previous deploy live, so the site never ships without prayer times.
// From 1 December, also warns when next year's data has not been synced yet.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateYear, type PrayerYear } from './lib.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const { prayerZone: zone } = JSON.parse(readFileSync(join(ROOT, 'config', 'site.json'), 'utf8')) as {
  prayerZone: string;
};

const nowMyt = new Date(Date.now() + 8 * 60 * 60 * 1000);
const year = nowMyt.getUTCFullYear();
const file = (y: number) => join(ROOT, 'data', 'waktu-solat', `${zone}-${y}.json`);

if (!existsSync(file(year))) {
  console.error(
    `Waktu Solat: no data for ${zone} ${year}. Run \`pnpm waktu-solat:sync\` and commit the result.`,
  );
  process.exit(1);
}

const data = JSON.parse(readFileSync(file(year), 'utf8')) as PrayerYear;
if (data.zone !== zone) {
  console.error(`Waktu Solat: ${file(year)} is for zone ${data.zone}, but config/site.json says ${zone}.`);
  process.exit(1);
}
validateYear(data.days, year);
console.log(`Waktu Solat: ${zone} ${year} OK (${data.days.length} days)`);

if (nowMyt.getUTCMonth() === 11 && !existsSync(file(year + 1))) {
  console.warn(
    `WARNING: Waktu Solat data for ${year + 1} is not committed yet. Run \`pnpm waktu-solat:sync\` before 1 January.`,
  );
}

// Fetches official prayer times from JAKIM e-Solat, validates them and writes
// data/waktu-solat/<zone>-<year>.json. The site build only ever reads these files.
//
// Usage: node scripts/waktu-solat/sync.ts [--year 2026]
// Exit code 0 = success (changed or unchanged), 1 = fetch/validation failure (existing files untouched).

import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { hasChanged, parseResponse, validateYear, type PrayerYear } from './lib.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const ENDPOINT = 'https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=duration';
const SOURCE = 'JAKIM e-Solat';
const SOURCE_URL = 'https://www.e-solat.gov.my/';

const site = JSON.parse(readFileSync(join(ROOT, 'config', 'site.json'), 'utf8')) as { prayerZone: string };
const zone = site.prayerZone;

function yearsToSync(): number[] {
  const flag = process.argv.indexOf('--year');
  if (flag !== -1) return [Number(process.argv[flag + 1])];
  const nowMyt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const year = nowMyt.getUTCFullYear();
  return [year, year + 1];
}

async function fetchYear(year: number) {
  const body = new URLSearchParams({ datestart: `${year}-01-01`, dateend: `${year}-12-31` });
  const res = await fetch(`${ENDPOINT}&zone=${encodeURIComponent(zone)}`, {
    method: 'POST',
    body,
    headers: { 'User-Agent': 'masjid-al-ihsan-website (waktu-solat-sync)' },
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`e-Solat HTTP ${res.status} for ${zone} ${year}`);
  return parseResponse(await res.json());
}

const changedFiles: string[] = [];
let failed = false;
const [currentYear] = yearsToSync();

for (const year of yearsToSync()) {
  const file = join(ROOT, 'data', 'waktu-solat', `${zone}-${year}.json`);
  try {
    const days = await fetchYear(year);
    if (days === null) {
      // Next year's takwim is usually published late in the year; only the current year is required.
      if (year === currentYear) throw new Error(`e-Solat has no data for the current year ${year}`);
      console.log(`${zone} ${year}: not published yet — skipped`);
      continue;
    }
    validateYear(days, year);

    const next: PrayerYear = {
      source: SOURCE,
      sourceUrl: SOURCE_URL,
      zone,
      year,
      fetchedAt: new Date().toISOString(),
      days,
    };
    const previous = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as PrayerYear) : null;
    if (hasChanged(previous, next)) {
      writeFileSync(file, JSON.stringify(next, null, 2) + '\n');
      changedFiles.push(file);
      console.log(`${zone} ${year}: ${previous ? 'updated' : 'created'} (${days.length} days)`);
    } else {
      console.log(`${zone} ${year}: unchanged`);
    }
  } catch (error) {
    failed = true;
    console.error(`${zone} ${year}: FAILED — existing data kept.\n${(error as Error).message}`);
  }
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changedFiles.length > 0}\n`);
}
process.exit(failed ? 1 : 0);

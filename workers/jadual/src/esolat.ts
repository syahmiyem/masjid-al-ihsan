// Weekly e-Solat check (plan 4.8): compares JAKIM's current data with the committed copy.
// Uses the same parser and validator as scripts/waktu-solat/sync.ts.
import { parseResponse, validateYear, type PrayerDay } from '../../../scripts/waktu-solat/lib.ts';

export type CheckResult =
  | { year: number; state: 'same' }
  | { year: number; state: 'different'; changedDays: string[] }
  | { year: number; state: 'not-published' } // JAKIM has no data yet (normal for next year until late in the year)
  | { year: number; state: 'missing-in-repo' } // JAKIM has it but it isn't committed yet → run the sync
  | { year: number; state: 'error'; message: string };

/** Dates whose times differ between the two copies (pure; unit-tested). */
export function diffDays(official: PrayerDay[], committed: PrayerDay[]): string[] {
  const byDate = new Map(committed.map((d) => [d.date, JSON.stringify(d)]));
  const changed = official.filter((d) => byDate.get(d.date) !== JSON.stringify(d)).map((d) => d.date);
  const missing = committed.filter((d) => !official.some((o) => o.date === d.date)).map((d) => d.date);
  return [...changed, ...missing].sort();
}

export async function checkYear(year: number, zone: string, dataBaseUrl: string): Promise<CheckResult> {
  try {
    const res = await fetch(
      `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=duration&zone=${encodeURIComponent(zone)}`,
      {
        method: 'POST',
        body: new URLSearchParams({ datestart: `${year}-01-01`, dateend: `${year}-12-31` }),
        headers: { 'User-Agent': 'masjid-al-ihsan-website (jadual)' },
      },
    );
    if (!res.ok) return { year, state: 'error', message: `e-Solat HTTP ${res.status}` };
    const official = parseResponse(await res.json());
    if (official === null) return { year, state: 'not-published' };
    validateYear(official, year);

    const committedRes = await fetch(`${dataBaseUrl}/${zone}-${year}.json`);
    if (committedRes.status === 404) return { year, state: 'missing-in-repo' };
    if (!committedRes.ok)
      return { year, state: 'error', message: `committed data HTTP ${committedRes.status}` };
    const committed = ((await committedRes.json()) as { days: PrayerDay[] }).days;

    const changedDays = diffDays(official, committed);
    return changedDays.length ? { year, state: 'different', changedDays } : { year, state: 'same' };
  } catch (error) {
    return { year, state: 'error', message: (error as Error).message };
  }
}

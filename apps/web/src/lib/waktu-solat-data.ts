// Build-time access to committed JAKIM e-Solat data (plan 4.8). The site never calls e-Solat itself.
import type { PrayerDay } from './waktu-solat.ts';

type PrayerYearFile = { zone: string; year: number; days: PrayerDay[] };

const files = import.meta.glob<PrayerYearFile>('../../../../data/waktu-solat/*.json', {
  eager: true,
  import: 'default',
});

const byDate = new Map<string, PrayerDay>();
for (const file of Object.values(files)) for (const day of file.days) byDate.set(day.date, day);

export const prayerZone = Object.values(files)[0]?.zone ?? '';

export function prayerDay(isoDate: string): PrayerDay | undefined {
  return byDate.get(isoDate);
}

/** Today's date and time in Asia/Kuala_Lumpur (UTC+8, no DST). */
export function nowMyt(): { date: string; time: string } {
  const iso = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

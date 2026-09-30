// Everything a page needs at build time, loaded once per build.
import siteConfig from '../../../../config/site.json';
import { addDays } from './dates.ts';
import { calendarItems } from './calendar.ts';
import { getAktiviti, getKuliahPerubahan, getKuliahSiri } from './sanity.ts';
import { nowMyt, prayerDay, prayerZone } from './waktu-solat-data.ts';

export const zone = { code: prayerZone, name: siteConfig.prayerZoneName };

export function today() {
  return nowMyt();
}

export async function calendarSources() {
  const [aktiviti, siri, perubahan] = await Promise.all([
    getAktiviti(),
    getKuliahSiri(),
    getKuliahPerubahan(),
  ]);
  return { aktiviti, siri, perubahan, prayerDay, today: nowMyt().date };
}

/** Items from today for the next `days` days (home "Minggu Ini", kuliah "Minggu Ini"). */
export async function upcoming(days: number, kind?: 'aktiviti' | 'kuliah') {
  const src = await calendarSources();
  const items = calendarItems(src.today, addDays(src.today, days - 1), src);
  return kind ? items.filter((i) => i.kind === kind) : items;
}

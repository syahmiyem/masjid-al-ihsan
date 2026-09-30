// Pure helpers for prayer times (plan 4.8). Data loading lives in waktu-solat-data.ts.

export type PrayerDay = {
  date: string;
  hijri: string;
  imsak: string;
  subuh: string;
  syuruk: string;
  dhuha: string;
  zohor: string;
  asar: string;
  maghrib: string;
  isyak: string;
};

export type PrayerKey = 'subuh' | 'zohor' | 'asar' | 'maghrib' | 'isyak';

export const MAIN_PRAYERS: PrayerKey[] = ['subuh', 'zohor', 'asar', 'maghrib', 'isyak'];

/** Display name; Zohor is "Jumaat" on Fridays. */
export function prayerLabel(key: PrayerKey, isoDate: string): string {
  if (key === 'zohor' && new Date(`${isoDate}T00:00:00Z`).getUTCDay() === 5) return 'Jumaat';
  return { subuh: 'Subuh', zohor: 'Zohor', asar: 'Asar', maghrib: 'Maghrib', isyak: 'Isyak' }[key];
}

/** Next main prayer after `nowHHMM` today, or null if Isyak has passed (caller shows tomorrow's Subuh). */
export function nextPrayer(day: PrayerDay, nowHHMM: string): PrayerKey | null {
  return MAIN_PRAYERS.find((key) => day[key] > nowHHMM) ?? null;
}

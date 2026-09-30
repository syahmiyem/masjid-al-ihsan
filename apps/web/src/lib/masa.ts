// Turns a stored time (clock or prayer-relative) into Malay text, using official prayer times (plan 4.8, D-12).
import { formatTime } from './format.ts';
import type { Masa } from './types.ts';
import type { PrayerDay, PrayerKey } from './waktu-solat.ts';

const RELATIVE: Record<string, { label: string; prayer: PrayerKey; before?: boolean }> = {
  'selepas-subuh': { label: 'Selepas Subuh', prayer: 'subuh' },
  'sebelum-zohor': { label: 'Sebelum Zohor', prayer: 'zohor', before: true },
  'selepas-zohor': { label: 'Selepas Zohor', prayer: 'zohor' },
  'selepas-jumaat': { label: 'Selepas solat Jumaat', prayer: 'zohor' },
  'selepas-asar': { label: 'Selepas Asar', prayer: 'asar' },
  'sebelum-maghrib': { label: 'Sebelum Maghrib', prayer: 'maghrib', before: true },
  'selepas-maghrib': { label: 'Selepas Maghrib', prayer: 'maghrib' },
  'selepas-isyak': { label: 'Selepas Isyak', prayer: 'isyak' },
};

const PRAYER_NAME: Record<PrayerKey, string> = {
  subuh: 'Subuh',
  zohor: 'Zohor',
  asar: 'Asar',
  maghrib: 'Maghrib',
  isyak: 'Isyak',
};

/**
 * "8:30 malam", "8:00 pagi – 11:00 pagi", "Selepas Maghrib (Maghrib 7:02 malam)",
 * "Selepas Isyak (Isyak 8:10 malam) hingga 10:00 malam".
 * The official prayer time is shown only when data exists for that date.
 */
export function masaLabel(masa: Masa, prayerDay?: PrayerDay): string {
  const end = masa.jamTamat ? formatTime(masa.jamTamat) : '';
  if (masa.jenis === 'jam' && masa.jam) {
    return end ? `${formatTime(masa.jam)} – ${end}` : formatTime(masa.jam);
  }
  const rel = masa.waktuSolat ? RELATIVE[masa.waktuSolat] : undefined;
  if (!rel) return '';
  const official = prayerDay ? ` (${PRAYER_NAME[rel.prayer]} ${formatTime(prayerDay[rel.prayer])})` : '';
  return `${rel.label}${official}${end ? ` hingga ${end}` : ''}`;
}

/** Short label without the official time, e.g. for the weekly timetable: "Selepas Maghrib". */
export function masaLabelShort(masa: Masa): string {
  if (masa.jenis === 'jam' && masa.jam) return formatTime(masa.jam);
  return (masa.waktuSolat && RELATIVE[masa.waktuSolat]?.label) || '';
}

/** Approximate start as HH:MM for sorting items within a day; prayer-relative items use the prayer time. */
export function masaSortKey(masa: Masa, prayerDay?: PrayerDay): string {
  if (masa.jenis === 'jam' && masa.jam) return masa.jam;
  const rel = masa.waktuSolat ? RELATIVE[masa.waktuSolat] : undefined;
  if (!rel) return '99:99';
  const fallback = { subuh: '06:00', zohor: '13:15', asar: '16:30', maghrib: '19:15', isyak: '20:25' };
  const time = prayerDay?.[rel.prayer] ?? fallback[rel.prayer];
  return rel.before ? `${time}.0` : `${time}.1`; // just before / just after the prayer itself
}

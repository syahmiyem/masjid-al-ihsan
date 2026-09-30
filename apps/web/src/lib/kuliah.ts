// Expands kuliah series (rules) into dated occurrences and applies per-date changes (D-11, plan 4.2).
import { dateRange, nthWeekdayOfMonth, monthRange, weekdayOf } from './dates.ts';
import { formatDate } from './format.ts';
import type { KuliahPerubahan, KuliahSiri, Masa } from './types.ts';

export type OccurrenceStatus = 'dijadualkan' | 'dipinda' | 'ditangguhkan' | 'dibatalkan';

export type KuliahOccurrence = {
  siri: KuliahSiri;
  date: string;
  masa: Masa;
  tempat: string;
  penceramah?: string;
  status: OccurrenceStatus;
  /** Short label for the status badge, e.g. "PENCERAMAH JEMPUTAN" */
  label?: string;
  /** Sentence shown to jemaah, e.g. "Ditangguhkan ke Isnin, 19 Oktober 2026." */
  note?: string;
};

function scheduledDates(siri: KuliahSiri, from: string, to: string): string[] {
  const start = siri.aktifDari > from ? siri.aktifDari : from;
  const end = siri.aktifHingga && siri.aktifHingga < to ? siri.aktifHingga : to;
  if (start > end) return [];
  if (siri.jenis === 'mingguan') {
    return dateRange(start, end).filter((d) => weekdayOf(d) === siri.hari);
  }
  const nth = siri.mingguKe === 'terakhir' ? 'terakhir' : Number(siri.mingguKe ?? 1);
  return monthRange(start.slice(0, 7), end.slice(0, 7))
    .map((m) => nthWeekdayOfMonth(m, siri.hari, nth))
    .filter((d): d is string => Boolean(d) && d! >= start && d! <= end);
}

const withReason = (text: string, sebab?: string) => (sebab ? `${text} ${sebab}` : text);

/** All occurrences between `from` and `to` (inclusive), sorted by date. Cancelled dates stay visible. */
export function expandKuliah(
  series: KuliahSiri[],
  changes: KuliahPerubahan[],
  from: string,
  to: string,
): KuliahOccurrence[] {
  const byKey = new Map(changes.map((c) => [`${c.siri}|${c.tarikh}`, c]));
  const out: KuliahOccurrence[] = [];

  for (const siri of series) {
    for (const date of scheduledDates(siri, from, to)) {
      const base: KuliahOccurrence = {
        siri,
        date,
        masa: siri.masa,
        tempat: siri.tempat,
        penceramah: siri.penceramah,
        status: 'dijadualkan',
      };
      const change = byKey.get(`${siri._id}|${date}`);
      if (!change) {
        out.push(base);
        continue;
      }
      switch (change.jenis) {
        case 'dibatalkan':
          out.push({
            ...base,
            status: 'dibatalkan',
            note: withReason('Kuliah ini dibatalkan.', change.sebab),
          });
          break;
        case 'ditangguhkan':
          out.push({
            ...base,
            status: 'ditangguhkan',
            note: withReason(
              change.tarikhBaharu ? `Ditangguhkan ke ${formatDate(change.tarikhBaharu)}.` : 'Ditangguhkan.',
              change.sebab,
            ),
          });
          break;
        case 'penceramah-jemputan':
          out.push({
            ...base,
            status: 'dipinda',
            label: 'PENCERAMAH JEMPUTAN',
            penceramah: change.penceramahJemputan ?? base.penceramah,
            note: change.sebab,
          });
          break;
        case 'tukar-tempat':
          out.push({
            ...base,
            status: 'dipinda',
            label: 'TUKAR TEMPAT',
            tempat: change.tempatBaharu ?? base.tempat,
            note: withReason(`Tempat baharu: ${change.tempatBaharu ?? ''}.`, change.sebab),
          });
          break;
        case 'tukar-masa':
          out.push({
            ...base,
            status: 'dipinda',
            label: 'TUKAR MASA',
            masa: change.masaBaharu ?? base.masa,
            note: change.sebab,
          });
          break;
      }
    }

    // Postponed kuliah also appear on their new date
    for (const change of changes) {
      if (change.siri !== siri._id || change.jenis !== 'ditangguhkan' || !change.tarikhBaharu) continue;
      if (change.tarikhBaharu < from || change.tarikhBaharu > to) continue;
      out.push({
        siri,
        date: change.tarikhBaharu,
        masa: siri.masa,
        tempat: siri.tempat,
        penceramah: siri.penceramah,
        status: 'dipinda',
        label: 'TARIKH GANTIAN',
        note: `Gantian bagi kuliah ${formatDate(change.tarikh)}.`,
      });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** "Setiap Isnin" / "Rabu minggu pertama setiap bulan" / "Jumaat terakhir setiap bulan" */
export function ruleLabel(siri: KuliahSiri): string {
  const day = {
    ahad: 'Ahad',
    isnin: 'Isnin',
    selasa: 'Selasa',
    rabu: 'Rabu',
    khamis: 'Khamis',
    jumaat: 'Jumaat',
    sabtu: 'Sabtu',
  }[siri.hari];
  if (siri.jenis === 'mingguan') return `Setiap ${day}`;
  if (siri.mingguKe === 'terakhir') return `${day} terakhir setiap bulan`;
  const nth = { '1': 'pertama', '2': 'kedua', '3': 'ketiga', '4': 'keempat' }[siri.mingguKe ?? '1'];
  return `${day} minggu ${nth} setiap bulan`;
}

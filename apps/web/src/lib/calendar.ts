// One combined calendar of activities + kuliah occurrences (plan 4.1–4.2: "one combined view").
import { addMonths, dateRange } from './dates.ts';
import { formatDate } from './format.ts';
import { expandKuliah } from './kuliah.ts';
import { masaLabel, masaSortKey } from './masa.ts';
import type { Aktiviti, KuliahPerubahan, KuliahSiri } from './types.ts';
import type { PrayerDay } from './waktu-solat.ts';

export type DisplayStatus = 'dijadualkan' | 'dipinda' | 'ditangguhkan' | 'dibatalkan' | 'berlangsung';

export type CalendarItem = {
  kind: 'aktiviti' | 'kuliah';
  key: string;
  date: string;
  title: string;
  time: string;
  sortKey: string;
  place: string;
  speaker?: string;
  status: DisplayStatus;
  label?: string;
  note?: string;
  href: string;
};

type Sources = {
  aktiviti: Aktiviti[];
  siri: KuliahSiri[];
  perubahan: KuliahPerubahan[];
  prayerDay: (iso: string) => PrayerDay | undefined;
  today: string;
};

const past = (date: string, today: string, status: DisplayStatus): DisplayStatus =>
  date < today && status === 'dijadualkan' ? 'berlangsung' : status;

export function calendarItems(from: string, to: string, src: Sources): CalendarItem[] {
  const items: CalendarItem[] = [];

  for (const a of src.aktiviti) {
    const days = dateRange(a.tarikhMula, a.tarikhTamat ?? a.tarikhMula).filter((d) => d >= from && d <= to);
    for (const date of days) {
      items.push({
        kind: 'aktiviti',
        key: `${a._id}|${date}`,
        date,
        title: a.tajuk,
        time: masaLabel(a.masa, src.prayerDay(date)),
        sortKey: masaSortKey(a.masa, src.prayerDay(date)),
        place: a.tempat,
        speaker: a.penceramah,
        status: past(date, src.today, a.status),
        note:
          a.status === 'ditangguhkan' && a.tarikhBaharu
            ? `Ditangguhkan ke ${formatDate(a.tarikhBaharu)}.${a.notaPerubahan ? ` ${a.notaPerubahan}` : ''}`
            : a.notaPerubahan,
        href: `/aktiviti/${a.slug}`,
      });
    }
    // A postponed activity also appears on its new date
    if (a.status === 'ditangguhkan' && a.tarikhBaharu && a.tarikhBaharu >= from && a.tarikhBaharu <= to) {
      items.push({
        kind: 'aktiviti',
        key: `${a._id}|${a.tarikhBaharu}|baharu`,
        date: a.tarikhBaharu,
        title: a.tajuk,
        time: masaLabel(a.masa, src.prayerDay(a.tarikhBaharu)),
        sortKey: masaSortKey(a.masa, src.prayerDay(a.tarikhBaharu)),
        place: a.tempat,
        speaker: a.penceramah,
        status: past(a.tarikhBaharu, src.today, 'dipinda'),
        label: 'TARIKH BAHARU',
        note: `Asalnya ${formatDate(a.tarikhMula)}.`,
        href: `/aktiviti/${a.slug}`,
      });
    }
  }

  for (const o of expandKuliah(src.siri, src.perubahan, from, to)) {
    items.push({
      kind: 'kuliah',
      key: `${o.siri._id}|${o.date}|${o.label ?? ''}`,
      date: o.date,
      title: o.siri.nama,
      time: masaLabel(o.masa, src.prayerDay(o.date)),
      sortKey: masaSortKey(o.masa, src.prayerDay(o.date)),
      place: o.tempat,
      speaker: o.penceramah,
      status: past(o.date, src.today, o.status),
      label: o.label,
      note: o.note,
      href: `/kuliah/${o.siri.slug}`,
    });
  }

  return items.sort((x, y) => x.date.localeCompare(y.date) || x.sortKey.localeCompare(y.sortKey));
}

/** Months the calendar offers: from the first month with content (or the launch month) to 3 months ahead. */
export function calendarMonths(today: string, contentDates: string[]): string[] {
  const first = [...contentDates, today].sort()[0].slice(0, 7);
  const last = addMonths(today.slice(0, 7), 3);
  const months: string[] = [];
  for (let m = first; m <= last; m = addMonths(m, 1)) months.push(m);
  return months;
}

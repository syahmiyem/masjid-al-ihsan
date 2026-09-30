// "Tambah ke Kalendar" (plan 4.1, D-33): RFC 5545 .ics files and Google Calendar links, built at build time.
// Clock times are Asia/Kuala_Lumpur (UTC+8, no DST) and written in UTC. Prayer-relative times become
// all-day entries with the label in the title (plan 4.1), because the exact time varies by date.
import { addDays } from './dates.ts';
import { masaLabelShort } from './masa.ts';
import type { KuliahSiri, Masa } from './types.ts';

export type CalEvent = {
  uid: string;
  title: string;
  date: string; // start date YYYY-MM-DD
  endDate?: string; // last day (inclusive), multi-day events
  masa: Masa;
  location: string;
  description?: string;
  url: string;
  rrule?: string;
  exdates?: string[]; // cancelled dates of a series
};

const pad = (n: number) => String(n).padStart(2, '0');

/** MYT date + HH:MM → "YYYYMMDDTHHMMSSZ" */
export function mytToUtc(date: string, hhmm: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = hhmm.split(':').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d, h - 8, min));
  return `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}T${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}00Z`;
}

const compact = (date: string) => date.replaceAll('-', '');

function timing(e: CalEvent): { allDay: boolean; start: string; end: string; title: string } {
  const last = e.endDate ?? e.date;
  if (e.masa.jenis === 'jam' && e.masa.jam) {
    const endTime =
      e.masa.jamTamat ?? `${pad(Math.min(23, Number(e.masa.jam.slice(0, 2)) + 1))}:${e.masa.jam.slice(3)}`;
    return {
      allDay: false,
      start: mytToUtc(e.date, e.masa.jam),
      end: mytToUtc(last, endTime),
      title: e.title,
    };
  }
  return {
    allDay: true,
    start: compact(e.date),
    end: compact(addDays(last, 1)),
    title: `${e.title} – ${masaLabelShort(e.masa).toLowerCase()}`,
  };
}

function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold lines longer than 75 octets (RFC 5545 §3.1). */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  for (const ch of line) {
    if (new TextEncoder().encode(current + ch).length > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = ch;
    } else current += ch;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

export function buildIcs(e: CalEvent, dtstamp = '20260101T000000Z'): string {
  const t = timing(e);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Masjid Al-Ihsan//Laman Web//MS',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.uid}`,
    `DTSTAMP:${dtstamp}`,
    t.allDay ? `DTSTART;VALUE=DATE:${t.start}` : `DTSTART:${t.start}`,
    t.allDay ? `DTEND;VALUE=DATE:${t.end}` : `DTEND:${t.end}`,
    ...(e.rrule ? [`RRULE:${e.rrule}`] : []),
    ...(e.exdates?.length
      ? [
          t.allDay
            ? `EXDATE;VALUE=DATE:${e.exdates.map(compact).join(',')}`
            : `EXDATE:${e.exdates.map((d) => mytToUtc(d, e.masa.jam!)).join(',')}`,
        ]
      : []),
    `SUMMARY:${escapeText(t.title)}`,
    `LOCATION:${escapeText(e.location)}`,
    `DESCRIPTION:${escapeText([e.description, `Maklumat lanjut: ${e.url}`].filter(Boolean).join('\n'))}`,
    `URL:${e.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function googleCalendarLink(e: CalEvent): string {
  const t = timing(e);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: t.title,
    dates: `${t.start}/${t.end}`,
    details: [e.description, `Maklumat lanjut: ${e.url}`].filter(Boolean).join('\n'),
    location: e.location,
    ctz: 'Asia/Kuala_Lumpur',
  });
  if (e.rrule) params.set('recur', `RRULE:${e.rrule}`);
  return `https://calendar.google.com/calendar/render?${params}`;
}

const BYDAY = { ahad: 'SU', isnin: 'MO', selasa: 'TU', rabu: 'WE', khamis: 'TH', jumaat: 'FR', sabtu: 'SA' };

/** RRULE for a kuliah series: weekly, nth weekday, or last weekday of the month. */
export function kuliahRrule(s: KuliahSiri): string {
  const day = BYDAY[s.hari];
  const until = s.aktifHingga ? `;UNTIL=${compact(s.aktifHingga)}` : '';
  if (s.jenis === 'mingguan') return `FREQ=WEEKLY;BYDAY=${day}${until}`;
  const n = s.mingguKe === 'terakhir' ? '-1' : (s.mingguKe ?? '1');
  return `FREQ=MONTHLY;BYDAY=${n}${day}${until}`;
}

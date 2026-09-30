import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildIcs, googleCalendarLink, kuliahRrule, mytToUtc, type CalEvent } from './ics.ts';
import type { KuliahSiri } from './types.ts';

const clock: CalEvent = {
  uid: 'contoh-aktiviti-jenazah@masjid-al-ihsan',
  title: 'Kursus Pengurusan Jenazah',
  date: '2026-10-24',
  masa: { jenis: 'jam', jam: '08:30', jamTamat: '13:00' },
  location: 'Dewan Serbaguna, Masjid Al-Ihsan, Felda Sg Panching Selatan, Kuantan',
  description: 'Teori dan amali; terbuka kepada lelaki dan wanita.',
  url: 'https://example.org/aktiviti/kursus',
};

test('MYT to UTC', () => {
  assert.equal(mytToUtc('2026-10-24', '08:30'), '20261024T003000Z');
  assert.equal(mytToUtc('2026-10-24', '06:00'), '20261023T220000Z');
});

test('clock-time event', () => {
  const ics = buildIcs(clock);
  assert.match(ics, /DTSTART:20261024T003000Z\r\n/);
  assert.match(ics, /DTEND:20261024T050000Z\r\n/);
  assert.match(ics, /SUMMARY:Kursus Pengurusan Jenazah\r\n/);
  assert.match(ics, /DESCRIPTION:Teori dan amali\; terbuka/); // escaped semicolon
  assert.ok(
    ics.split('\r\n').every((l) => new TextEncoder().encode(l).length <= 75),
    'lines folded to 75 octets',
  );
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
});

test('prayer-relative event becomes all-day with the label in the title', () => {
  const ics = buildIcs({ ...clock, masa: { jenis: 'solat', waktuSolat: 'selepas-maghrib' } });
  assert.match(ics, /DTSTART;VALUE=DATE:20261024\r\n/);
  assert.match(ics, /DTEND;VALUE=DATE:20261025\r\n/);
  assert.match(ics, /SUMMARY:Kursus Pengurusan Jenazah – selepas Maghrib/);
});

test('series with cancelled dates', () => {
  const ics = buildIcs({
    ...clock,
    masa: { jenis: 'solat', waktuSolat: 'selepas-maghrib' },
    rrule: 'FREQ=WEEKLY;BYDAY=MO',
    exdates: ['2026-10-12'],
  });
  assert.match(ics, /RRULE:FREQ=WEEKLY;BYDAY=MO\r\n/);
  assert.match(ics, /EXDATE;VALUE=DATE:20261012\r\n/);
});

test('RRULE for weekly, nth and last weekday', () => {
  const s = { hari: 'rabu', jenis: 'bulanan', mingguKe: '1' } as KuliahSiri;
  assert.equal(kuliahRrule(s), 'FREQ=MONTHLY;BYDAY=1WE');
  assert.equal(kuliahRrule({ ...s, mingguKe: 'terakhir' }), 'FREQ=MONTHLY;BYDAY=-1WE');
  assert.equal(
    kuliahRrule({ ...s, jenis: 'mingguan', aktifHingga: '2027-02-28' }),
    'FREQ=WEEKLY;BYDAY=WE;UNTIL=20270228',
  );
});

test('Google Calendar link', () => {
  const url = new URL(googleCalendarLink(clock));
  assert.equal(url.searchParams.get('dates'), '20261024T003000Z/20261024T050000Z');
  assert.equal(url.searchParams.get('text'), 'Kursus Pengurusan Jenazah');
});

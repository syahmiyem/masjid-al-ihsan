import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasChanged, parseMalayDate, parseResponse, validateYear, type PrayerDay } from './lib.ts';

const rawDay = {
  hijri: '1448-04-19',
  date: '01-Okt-2026',
  day: 'Thursday',
  imsak: '05:38:00',
  fajr: '05:48:00',
  syuruk: '06:56:00',
  dhuha: '07:21:00',
  dhuhr: '13:00:00',
  asr: '16:09:00',
  maghrib: '19:02:00',
  isha: '20:10:00',
};

test('parses Malay month abbreviations, including Ogos', () => {
  assert.equal(parseMalayDate('01-Okt-2026'), '2026-10-01');
  assert.equal(parseMalayDate('15-Ogos-2026'), '2026-08-15');
  assert.equal(parseMalayDate('03-Mac-2027'), '2027-03-03');
  assert.throws(() => parseMalayDate('01-Oct-2026'));
});

test('maps e-Solat fields to Malay names and drops seconds', () => {
  const [day] = parseResponse({ status: 'OK!', prayerTime: [rawDay] })!;
  assert.deepEqual(day, {
    date: '2026-10-01',
    hijri: '1448-04-19',
    imsak: '05:38',
    subuh: '05:48',
    syuruk: '06:56',
    dhuha: '07:21',
    zohor: '13:00',
    asar: '16:09',
    maghrib: '19:02',
    isyak: '20:10',
  });
});

test('NO_RECORD means "not published yet", not an error', () => {
  assert.equal(parseResponse({ status: 'NO_RECORD!', prayerTime: { data: [] } }), null);
});

test('rejects unexpected responses', () => {
  assert.throws(() => parseResponse({ status: 'ERROR' }));
  assert.throws(() => parseResponse({ status: 'OK!', prayerTime: [{ ...rawDay, isha: '8:10 PM' }] }));
});

function fullYear(year: number): PrayerDay[] {
  const days: PrayerDay[] = [];
  for (
    let d = new Date(Date.UTC(year, 0, 1));
    d.getUTCFullYear() === year;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    days.push({
      date: d.toISOString().slice(0, 10),
      hijri: '1448-01-01',
      imsak: '05:40',
      subuh: '05:50',
      syuruk: '07:00',
      dhuha: '07:25',
      zohor: '13:05',
      asar: '16:20',
      maghrib: '19:10',
      isyak: '20:20',
    });
  }
  return days;
}

test('accepts a complete, ordered year', () => {
  assert.doesNotThrow(() => validateYear(fullYear(2026), 2026));
  assert.equal(fullYear(2028).length, 366);
  assert.doesNotThrow(() => validateYear(fullYear(2028), 2028));
});

test('rejects missing days and out-of-order times', () => {
  const missing = fullYear(2026).filter((d) => d.date !== '2026-06-15');
  assert.throws(() => validateYear(missing, 2026), /expected 365 days/);

  const swapped = fullYear(2026);
  swapped[10] = { ...swapped[10], asar: '12:00' };
  assert.throws(() => validateYear(swapped, 2026), /zohor 13:05 is not before asar 12:00/);
});

test('hasChanged ignores fetchedAt', () => {
  const base = {
    source: 'x',
    sourceUrl: 'x',
    zone: 'PHG02',
    year: 2026,
    fetchedAt: 'a',
    days: fullYear(2026),
  };
  assert.equal(hasChanged(base, { ...base, fetchedAt: 'b' }), false);
  assert.equal(hasChanged(base, { ...base, days: base.days.slice(1) }), true);
  assert.equal(hasChanged(null, base), true);
});

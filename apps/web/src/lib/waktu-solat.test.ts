import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextPrayer, prayerLabel, type PrayerDay } from './waktu-solat.ts';

const day: PrayerDay = {
  date: '2026-10-02',
  hijri: '1448-04-20',
  imsak: '05:37',
  subuh: '05:47',
  syuruk: '06:55',
  dhuha: '07:20',
  zohor: '13:00',
  asar: '16:09',
  maghrib: '19:01',
  isyak: '20:10',
};

test('next prayer either side of each boundary', () => {
  assert.equal(nextPrayer(day, '00:01'), 'subuh');
  assert.equal(nextPrayer(day, '05:47'), 'zohor');
  assert.equal(nextPrayer(day, '16:08'), 'asar');
  assert.equal(nextPrayer(day, '20:09'), 'isyak');
  assert.equal(nextPrayer(day, '23:59'), null);
});

test('Zohor is labelled Jumaat on Fridays only', () => {
  assert.equal(prayerLabel('zohor', '2026-10-02'), 'Jumaat');
  assert.equal(prayerLabel('zohor', '2026-10-03'), 'Zohor');
  assert.equal(prayerLabel('maghrib', '2026-10-02'), 'Maghrib');
});

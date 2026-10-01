import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PrayerDay } from '../../../scripts/waktu-solat/lib.ts';
import { diffDays } from './esolat.ts';

const day = (date: string, maghrib = '19:00'): PrayerDay => ({
  date,
  hijri: '1448-01-01',
  imsak: '05:40',
  subuh: '05:50',
  syuruk: '07:00',
  dhuha: '07:25',
  zohor: '13:00',
  asar: '16:20',
  maghrib,
  isyak: '20:10',
});

test('identical data has no differences', () => {
  assert.deepEqual(
    diffDays([day('2026-10-01'), day('2026-10-02')], [day('2026-10-01'), day('2026-10-02')]),
    [],
  );
});

test('a corrected time is reported by date', () => {
  assert.deepEqual(
    diffDays([day('2026-10-01'), day('2026-10-02', '19:01')], [day('2026-10-01'), day('2026-10-02')]),
    ['2026-10-02'],
  );
});

test('days missing on either side are reported', () => {
  assert.deepEqual(diffDays([day('2026-10-01')], [day('2026-10-01'), day('2026-10-02')]), ['2026-10-02']);
  assert.deepEqual(diffDays([day('2026-10-01'), day('2026-10-02')], [day('2026-10-01')]), ['2026-10-02']);
});

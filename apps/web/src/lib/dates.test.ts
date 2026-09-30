import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addDays,
  addMonths,
  monthBounds,
  monthRange,
  nthWeekdayOfMonth,
  weekStart,
  weekdayOf,
} from './dates.ts';

test('addDays crosses month and year boundaries', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
});

test('weekdayOf', () => {
  assert.equal(weekdayOf('2026-10-02'), 'jumaat');
  assert.equal(weekdayOf('2026-10-05'), 'isnin');
});

test('month helpers', () => {
  assert.deepEqual(monthBounds('2026-02'), { first: '2026-02-01', last: '2026-02-28' });
  assert.equal(addMonths('2026-12', 1), '2027-01');
  assert.equal(addMonths('2026-01', -1), '2025-12');
  assert.deepEqual(monthRange('2026-11', '2027-01'), ['2026-11', '2026-12', '2027-01']);
});

test('weekStart is Monday (Isnin)', () => {
  assert.equal(weekStart('2026-10-01'), '2026-09-28'); // Khamis → Isnin
  assert.equal(weekStart('2026-10-04'), '2026-09-28'); // Ahad belongs to the week before
  assert.equal(weekStart('2026-10-05'), '2026-10-05');
});

test('nthWeekdayOfMonth', () => {
  assert.equal(nthWeekdayOfMonth('2026-10', 'rabu', 1), '2026-10-07');
  assert.equal(nthWeekdayOfMonth('2026-10', 'jumaat', 'terakhir'), '2026-10-30');
  assert.equal(nthWeekdayOfMonth('2026-10', 'khamis', 5), '2026-10-29');
  assert.equal(nthWeekdayOfMonth('2026-11', 'isnin', 5), '2026-11-30');
  assert.equal(nthWeekdayOfMonth('2026-02', 'isnin', 5), undefined);
});

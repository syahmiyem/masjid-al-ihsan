import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDate, formatDateShort, formatHijri, formatTime } from './format.ts';

test('formatDate uses Malay day and month names', () => {
  assert.equal(formatDate('2026-10-06'), 'Selasa, 6 Oktober 2026');
  assert.equal(formatDate('2026-10-02'), 'Jumaat, 2 Oktober 2026');
  assert.equal(formatDate('2027-03-07'), 'Ahad, 7 Mac 2027');
  assert.equal(formatDateShort('2026-08-15'), '15 Ogos 2026');
});

test('formatTime uses 12-hour clock with Malay periods', () => {
  assert.equal(formatTime('05:48'), '5:48 pagi');
  assert.equal(formatTime('00:30'), '12:30 pagi');
  assert.equal(formatTime('12:15'), '12:15 tengah hari');
  assert.equal(formatTime('13:00'), '1:00 tengah hari');
  assert.equal(formatTime('16:09'), '4:09 petang');
  assert.equal(formatTime('19:02'), '7:02 malam');
  assert.equal(formatTime('20:30'), '8:30 malam');
  assert.throws(() => formatTime('8:30'));
});

test('formatHijri', () => {
  assert.equal(formatHijri('1448-04-19'), '19 Rabiulakhir 1448');
  assert.equal(formatHijri('1448-09-01'), '1 Ramadan 1448');
});

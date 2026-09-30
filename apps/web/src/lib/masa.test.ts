import assert from 'node:assert/strict';
import { test } from 'node:test';
import { masaLabel, masaLabelShort, masaSortKey } from './masa.ts';
import type { PrayerDay } from './waktu-solat.ts';

const day: PrayerDay = {
  date: '2026-10-05',
  hijri: '1448-04-23',
  imsak: '05:36',
  subuh: '05:46',
  syuruk: '06:54',
  dhuha: '07:19',
  zohor: '12:59',
  asar: '16:10',
  maghrib: '19:00',
  isyak: '20:09',
};

test('clock times', () => {
  assert.equal(masaLabel({ jenis: 'jam', jam: '20:30' }), '8:30 malam');
  assert.equal(masaLabel({ jenis: 'jam', jam: '08:00', jamTamat: '11:00' }), '8:00 pagi – 11:00 pagi');
});

test('prayer-relative times show the official prayer time when known', () => {
  assert.equal(
    masaLabel({ jenis: 'solat', waktuSolat: 'selepas-maghrib' }, day),
    'Selepas Maghrib (Maghrib 7:00 malam)',
  );
  assert.equal(masaLabel({ jenis: 'solat', waktuSolat: 'selepas-maghrib' }), 'Selepas Maghrib');
  assert.equal(
    masaLabel({ jenis: 'solat', waktuSolat: 'selepas-isyak', jamTamat: '22:00' }, day),
    'Selepas Isyak (Isyak 8:09 malam) hingga 10:00 malam',
  );
  assert.equal(masaLabelShort({ jenis: 'solat', waktuSolat: 'selepas-subuh' }), 'Selepas Subuh');
});

test('sort keys order a day correctly', () => {
  const items = [
    masaSortKey({ jenis: 'solat', waktuSolat: 'selepas-isyak' }, day),
    masaSortKey({ jenis: 'jam', jam: '10:00' }, day),
    masaSortKey({ jenis: 'solat', waktuSolat: 'selepas-subuh' }, day),
    masaSortKey({ jenis: 'solat', waktuSolat: 'selepas-maghrib' }, day),
    masaSortKey({ jenis: 'solat', waktuSolat: 'sebelum-maghrib' }, day),
  ].sort();
  assert.deepEqual(items, ['05:46.1', '10:00', '19:00.0', '19:00.1', '20:09.1']);
});

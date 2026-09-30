import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calendarItems, calendarMonths } from './calendar.ts';
import type { Aktiviti, KuliahSiri } from './types.ts';

const aktiviti: Aktiviti = {
  _id: 'a',
  tajuk: 'Gotong-royong',
  slug: 'gotong-royong',
  tarikhMula: '2026-10-10',
  masa: { jenis: 'jam', jam: '08:00' },
  tempat: 'Kawasan masjid',
  kategori: 'gotong-royong',
  status: 'ditangguhkan',
  tarikhBaharu: '2026-10-17',
};
const siri: KuliahSiri = {
  _id: 'k',
  nama: 'Kuliah Maghrib',
  slug: 'kuliah-maghrib',
  jenis: 'mingguan',
  hari: 'sabtu',
  masa: { jenis: 'solat', waktuSolat: 'selepas-maghrib' },
  tempat: 'Dewan Solat Utama',
  aktifDari: '2026-10-01',
};
const src = {
  aktiviti: [aktiviti],
  siri: [siri],
  perubahan: [],
  prayerDay: () => undefined,
  today: '2026-10-12',
};

test('combines activities and kuliah, sorted by date then time', () => {
  const items = calendarItems('2026-10-10', '2026-10-17', src);
  assert.deepEqual(
    items.map((i) => `${i.date} ${i.kind} ${i.status}${i.label ? ` ${i.label}` : ''}`),
    [
      '2026-10-10 aktiviti ditangguhkan',
      '2026-10-10 kuliah berlangsung',
      '2026-10-17 aktiviti dipinda TARIKH BAHARU',
      '2026-10-17 kuliah dijadualkan',
    ],
  );
  assert.equal(items[0].note, 'Ditangguhkan ke Sabtu, 17 Oktober 2026.');
});

test('calendar months run from first content month to 3 months ahead', () => {
  assert.deepEqual(calendarMonths('2026-10-12', ['2026-09-20']), [
    '2026-09',
    '2026-10',
    '2026-11',
    '2026-12',
    '2027-01',
  ]);
});

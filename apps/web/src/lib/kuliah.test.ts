import assert from 'node:assert/strict';
import { test } from 'node:test';
import { expandKuliah, ruleLabel } from './kuliah.ts';
import type { KuliahPerubahan, KuliahSiri } from './types.ts';

const weekly: KuliahSiri = {
  _id: 'maghrib',
  nama: 'Kuliah Maghrib',
  slug: 'kuliah-maghrib',
  jenis: 'mingguan',
  hari: 'isnin',
  masa: { jenis: 'solat', waktuSolat: 'selepas-maghrib' },
  tempat: 'Dewan Solat Utama',
  penceramah: 'Ustaz A',
  aktifDari: '2026-10-01',
};
const monthly: KuliahSiri = {
  ...weekly,
  _id: 'muslimah',
  nama: 'Kuliah Muslimah',
  jenis: 'bulanan',
  hari: 'rabu',
  mingguKe: '1',
};

test('weekly series: every Monday in range, respecting aktifDari/aktifHingga', () => {
  const dates = expandKuliah([weekly], [], '2026-09-01', '2026-10-31').map((o) => o.date);
  assert.deepEqual(dates, ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26']);
  const ended = expandKuliah([{ ...weekly, aktifHingga: '2026-10-15' }], [], '2026-10-01', '2026-10-31');
  assert.deepEqual(
    ended.map((o) => o.date),
    ['2026-10-05', '2026-10-12'],
  );
});

test('monthly series: first Wednesday of each month', () => {
  const dates = expandKuliah([monthly], [], '2026-10-01', '2026-12-31').map((o) => o.date);
  assert.deepEqual(dates, ['2026-10-07', '2026-11-04', '2026-12-02']);
  const last = expandKuliah([{ ...monthly, mingguKe: 'terakhir' }], [], '2026-10-01', '2026-10-31');
  assert.deepEqual(
    last.map((o) => o.date),
    ['2026-10-28'],
  );
});

test('a cancellation keeps the date visible with status and reason (plan acceptance test)', () => {
  const changes: KuliahPerubahan[] = [
    { _id: 'c1', siri: 'maghrib', tarikh: '2026-10-12', jenis: 'dibatalkan', sebab: 'Penceramah uzur.' },
  ];
  const occ = expandKuliah([weekly], changes, '2026-10-01', '2026-10-31');
  assert.equal(occ.length, 4);
  const cancelled = occ.find((o) => o.date === '2026-10-12')!;
  assert.equal(cancelled.status, 'dibatalkan');
  assert.equal(cancelled.note, 'Kuliah ini dibatalkan. Penceramah uzur.');
  assert.equal(occ.filter((o) => o.status === 'dijadualkan').length, 3);
});

test('postponement marks the old date and adds the new date', () => {
  const changes: KuliahPerubahan[] = [
    { _id: 'c2', siri: 'maghrib', tarikh: '2026-10-12', jenis: 'ditangguhkan', tarikhBaharu: '2026-10-14' },
  ];
  const occ = expandKuliah([weekly], changes, '2026-10-01', '2026-10-31');
  const old = occ.find((o) => o.date === '2026-10-12')!;
  assert.equal(old.status, 'ditangguhkan');
  assert.equal(old.note, 'Ditangguhkan ke Rabu, 14 Oktober 2026.');
  const replacement = occ.find((o) => o.date === '2026-10-14')!;
  assert.equal(replacement.label, 'TARIKH GANTIAN');
  assert.deepEqual(
    occ.map((o) => o.date),
    ['2026-10-05', '2026-10-12', '2026-10-14', '2026-10-19', '2026-10-26'],
  );
});

test('guest speaker, venue and time changes', () => {
  const changes: KuliahPerubahan[] = [
    {
      _id: 'g',
      siri: 'maghrib',
      tarikh: '2026-10-05',
      jenis: 'penceramah-jemputan',
      penceramahJemputan: 'Ustaz B',
    },
    {
      _id: 't',
      siri: 'maghrib',
      tarikh: '2026-10-19',
      jenis: 'tukar-tempat',
      tempatBaharu: 'Dewan Serbaguna',
    },
    {
      _id: 'm',
      siri: 'maghrib',
      tarikh: '2026-10-26',
      jenis: 'tukar-masa',
      masaBaharu: { jenis: 'solat', waktuSolat: 'selepas-isyak' },
    },
  ];
  const occ = expandKuliah([weekly], changes, '2026-10-01', '2026-10-31');
  assert.equal(occ[0].penceramah, 'Ustaz B');
  assert.equal(occ[0].label, 'PENCERAMAH JEMPUTAN');
  assert.equal(occ[2].tempat, 'Dewan Serbaguna');
  assert.equal(occ[3].masa.waktuSolat, 'selepas-isyak');
  assert.equal(occ[1].status, 'dijadualkan');
});

test('changes for other series or dates outside the range are ignored', () => {
  const changes: KuliahPerubahan[] = [
    { _id: 'x', siri: 'other', tarikh: '2026-10-05', jenis: 'dibatalkan' },
    { _id: 'y', siri: 'maghrib', tarikh: '2026-11-02', jenis: 'dibatalkan' },
  ];
  const occ = expandKuliah([weekly], changes, '2026-10-01', '2026-10-31');
  assert.ok(occ.every((o) => o.status === 'dijadualkan'));
});

test('rule labels', () => {
  assert.equal(ruleLabel(weekly), 'Setiap Isnin');
  assert.equal(ruleLabel(monthly), 'Rabu minggu pertama setiap bulan');
  assert.equal(ruleLabel({ ...monthly, mingguKe: 'terakhir' }), 'Rabu terakhir setiap bulan');
});

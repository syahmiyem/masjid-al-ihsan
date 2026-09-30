import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clip } from './h.ts';
import { paginate } from './paginate.ts';

test('fills pages up to the height budget', () => {
  const blocks = [1, 2, 3, 4, 5].map((v) => ({ height: 100, value: v }));
  assert.deepEqual(paginate(blocks, 250), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(paginate(blocks, 1000), [[1, 2, 3, 4, 5]]);
});

test('a heading is never left alone at the bottom of a page', () => {
  const blocks = [
    { height: 100, value: 'a' },
    { height: 60, value: 'Isnin', keepWithNext: true },
    { height: 100, value: 'b' },
  ];
  assert.deepEqual(paginate(blocks, 200), [['a'], ['Isnin', 'b']]);
});

test('an oversized block still gets its own page', () => {
  assert.deepEqual(paginate([{ height: 500, value: 'x' }], 200), [['x']]);
});

test('clip cuts on a word boundary', () => {
  assert.equal(clip('Kuliah Maghrib Mingguan', 50), 'Kuliah Maghrib Mingguan');
  assert.equal(clip('Kursus Pengurusan Jenazah untuk Semua', 20), 'Kursus Pengurusan…');
});

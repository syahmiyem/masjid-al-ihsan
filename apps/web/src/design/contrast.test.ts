import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contrastRatio } from './contrast.ts';
import { colours, contrastPairs } from './tokens.ts';

test('contrast formula matches known values', () => {
  assert.equal(contrastRatio('#000000', '#ffffff').toFixed(0), '21');
  assert.equal(contrastRatio('#ffffff', '#ffffff'), 1);
});

for (const [fg, bg, min, what] of contrastPairs) {
  test(`${what}: ${fg} on ${bg} ≥ ${min}:1`, () => {
    const ratio = contrastRatio(colours[fg], colours[bg]);
    assert.ok(
      ratio >= min,
      `${what}: ${colours[fg]} on ${colours[bg]} is ${ratio.toFixed(2)}:1, needs ${min}:1`,
    );
  });
}

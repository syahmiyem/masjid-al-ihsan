import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initials, speakerPhoto } from './speaker.ts';

test('initials skip titles and bin/binti', () => {
  assert.equal(initials('Ustaz Contoh Satu'), 'CS');
  assert.equal(initials('Ustaz Ahmad bin Ali'), 'AA');
  assert.equal(initials('Dr. Siti Aminah binti Yusof'), 'SY');
  assert.equal(initials("Dato' Haji Ismail"), 'I');
  assert.equal(initials('Ustazah'), '?');
});

test('photo URL only when there is an image, cropped square', () => {
  assert.equal(speakerPhoto({ nama: 'X' }, 96), undefined);
  const url = speakerPhoto(
    { nama: 'X', gambar: { alt: 'x', asset: { _ref: 'image-abc123-600x600-png' } } },
    96,
    'jpg',
  )!;
  assert.match(url, /\/images\/1xd617ey\/production\/abc123-600x600\.png\?/);
  assert.match(url, /w=96/);
  assert.match(url, /h=96/);
  assert.match(url, /fm=jpg/);
});

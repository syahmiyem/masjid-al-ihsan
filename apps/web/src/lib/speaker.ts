// Speakers (D-58): photo URLs that respect the crop/hotspot chosen in the Studio, and an initials
// fallback when there is no photo or no consent.
import { createImageUrlBuilder } from '@sanity/image-url';
import type { Speaker } from './types.ts';

const builder = createImageUrlBuilder({
  projectId: process.env.SANITY_PROJECT_ID || '1xd617ey',
  dataset: process.env.SANITY_DATASET || 'production',
});

/** Square photo URL, or undefined when there is no (consented) photo. */
export function speakerPhoto(
  s: Speaker | undefined,
  size: number,
  format: 'auto' | 'jpg' = 'auto',
): string | undefined {
  if (!s?.gambar?.asset) return undefined;
  const img = builder.image(s.gambar).width(size).height(size).fit('crop');
  return (format === 'jpg' ? img.format('jpg').quality(85) : img.auto('format')).url();
}

const TITLES = new Set([
  'ustaz',
  'ustazah',
  'dr',
  'dr.',
  'tuan',
  'puan',
  'haji',
  'hajah',
  'hj',
  'hj.',
  'hjh',
  'prof',
  'prof.',
  'syeikh',
  'sheikh',
  'datuk',
  "dato'",
  'dato',
  'al-fadhil',
  'ust',
  'ust.',
  'cikgu',
]);

/** "Ustaz Ahmad bin Ali" → "AA"; "Dr. Siti Aminah" → "SA". */
export function initials(name: string): string {
  const words = name
    .split(/\s+/)
    .filter(
      (w) =>
        w && !TITLES.has(w.toLowerCase()) && !['bin', 'binti', 'bt', 'b.', 'bte'].includes(w.toLowerCase()),
    );
  const letters = words
    .map((w) =>
      w
        .replace(/[^\p{L}]/gu, '')
        .charAt(0)
        .toUpperCase(),
    )
    .filter(Boolean);
  return (letters.length > 1 ? letters[0] + letters.at(-1) : (letters[0] ?? '?')).slice(0, 2);
}

// Poster → PNG at build time (D-30 option A): Satori lays out to SVG, resvg rasterises to PNG.
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { FORMATS, type FormatKey } from './frame.ts';
import type { PosterNode } from './h.ts';

// Embedded by Vite (?inline → data URL), so it works from the bundled build output too.
import font400 from './fonts/nunito-sans-latin-400-normal.woff?inline';
import font700 from './fonts/nunito-sans-latin-700-normal.woff?inline';

const decode = (dataUrl: string) => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
const font = (weight: 400 | 700) => decode(weight === 400 ? font400 : font700);

let fonts: { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] | undefined;

export async function renderPng(node: PosterNode, format: FormatKey): Promise<Uint8Array<ArrayBuffer>> {
  fonts ??= [
    { name: 'Nunito Sans', data: font(400), weight: 400, style: 'normal' },
    { name: 'Nunito Sans', data: font(700), weight: 700, style: 'normal' },
  ];
  const { width, height } = FORMATS[format];
  // biome-ignore lint: Satori accepts React-element-shaped objects
  const svg = await satori(node as unknown as Parameters<typeof satori>[0], { width, height, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'original' }, font: { loadSystemFonts: false } })
    .render()
    .asPng();
  return new Uint8Array(png);
}

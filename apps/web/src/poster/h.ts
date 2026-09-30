// Tiny element builder for Satori (React-element-shaped objects, no React needed).
export type Child = PosterNode | string | number | null | undefined | false;
export type PosterNode = { type: string; props: Record<string, unknown> };
export type Style = Record<string, string | number>;

export function h(type: string, style: Style = {}, ...children: (Child | Child[])[]): PosterNode {
  const kids = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
  return {
    type,
    props: { style: { display: 'flex', ...style }, children: kids.length === 1 ? kids[0] : kids },
  };
}

export const img = (src: string, width: number, height: number, style: Style = {}): PosterNode => ({
  type: 'img',
  props: { src, width, height, style },
});

/** Cut text to roughly `max` characters on a word boundary, adding "…" (Satori has no reliable line clamp). */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

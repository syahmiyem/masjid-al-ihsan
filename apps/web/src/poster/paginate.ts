// Split blocks of known height across images (plan 4.4: "Bahagian 1/2" rather than shrinking text).

export type Block<T> = {
  height: number;
  value: T;
  /** keep with the following block (headings) */ keepWithNext?: boolean;
};

export function paginate<T>(blocks: Block<T>[], budget: number): T[][] {
  const pages: T[][] = [];
  let page: T[] = [];
  let used = 0;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const next = b.keepWithNext ? (blocks[i + 1]?.height ?? 0) : 0;
    if (page.length > 0 && used + b.height + next > budget) {
      pages.push(page);
      page = [];
      used = 0;
    }
    page.push(b.value);
    used += b.height;
  }
  if (page.length) pages.push(page);
  return pages;
}

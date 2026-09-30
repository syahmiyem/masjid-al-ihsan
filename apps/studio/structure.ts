import type { StructureResolver } from 'sanity/structure';

// Task-based desk structure (plan 7.2). Filled in during Phase 1–2.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Kandungan')
    .items([
      S.listItem()
        .title('Tetapan Masjid')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ]);

import type { StructureResolver } from 'sanity/structure';

// Task-based desk structure in Malay (plan 7.2). Order follows how often each task is done (plan 7.1).
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Kandungan')
    .items([
      S.listItem()
        .title('Aktiviti & Kalendar')
        .schemaType('aktiviti')
        .child(
          S.documentTypeList('aktiviti')
            .title('Aktiviti')
            .defaultOrdering([{ field: 'tarikhMula', direction: 'desc' }]),
        ),
      S.listItem()
        .title('Jadual Kuliah')
        .child(
          S.list()
            .title('Jadual Kuliah')
            .items([
              S.documentTypeListItem('kuliahSiri').title('Siri Kuliah'),
              S.listItem()
                .title('Perubahan (Batal / Penceramah Jemputan)')
                .schemaType('kuliahPerubahan')
                .child(
                  S.documentTypeList('kuliahPerubahan')
                    .title('Perubahan Kuliah')
                    .defaultOrdering([{ field: 'tarikh', direction: 'desc' }]),
                ),
            ]),
        ),
      S.documentTypeListItem('notis').title('Notis Penting'),
      S.divider(),
      S.listItem()
        .title('Perkhidmatan')
        .schemaType('perkhidmatan')
        .child(
          S.documentTypeList('perkhidmatan')
            .title('Perkhidmatan')
            .defaultOrdering([{ field: 'susunan', direction: 'asc' }]),
        ),
      S.listItem()
        .title('Carta Organisasi')
        .schemaType('jawatan')
        .child(
          S.documentTypeList('jawatan')
            .title('Carta Organisasi')
            .defaultOrdering([
              { field: 'kumpulan', direction: 'asc' },
              { field: 'susunan', direction: 'asc' },
            ]),
        ),
      S.divider(),
      S.documentTypeListItem('tempat').title('Tempat'),
      S.listItem()
        .title('Tetapan Masjid')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Tetapan Masjid')),
    ]);

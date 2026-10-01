import type { StructureBuilder, StructureResolver } from 'sanity/structure';

// Task-based desk structure in Malay (plan 7.2). Order follows how often each task is done (plan 7.1).
// Archived items (diarkibkan) are hidden from the normal lists and collected under "Arkib" (plan 7.5).

type Ordering = { field: string; direction: 'asc' | 'desc' }[];

const active = (S: StructureBuilder, type: string, title: string, ordering: Ordering) =>
  S.listItem()
    .title(title)
    .schemaType(type)
    .child(
      S.documentTypeList(type)
        .title(title)
        .filter('_type == $type && diarkibkan != true')
        .params({ type })
        .defaultOrdering(ordering),
    );

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Kandungan')
    .items([
      active(S, 'aktiviti', 'Aktiviti & Kalendar', [{ field: 'tarikhMula', direction: 'desc' }]),
      S.listItem()
        .title('Jadual Kuliah')
        .child(
          S.list()
            .title('Jadual Kuliah')
            .items([
              active(S, 'kuliahSiri', 'Siri Kuliah', [{ field: 'nama', direction: 'asc' }]),
              active(S, 'kuliahPerubahan', 'Perubahan (Batal / Penceramah Jemputan)', [
                { field: 'tarikh', direction: 'desc' },
              ]),
            ]),
        ),
      active(S, 'notis', 'Notis Penting', [{ field: 'paparDari', direction: 'desc' }]),
      S.divider(),
      active(S, 'perkhidmatan', 'Khidmat', [{ field: 'susunan', direction: 'asc' }]),
      active(S, 'jawatan', 'Carta Organisasi', [
        { field: 'kumpulan', direction: 'asc' },
        { field: 'susunan', direction: 'asc' },
      ]),
      S.divider(),
      S.documentTypeListItem('tempat').title('Tempat'),
      S.listItem()
        .title('Tetapan Masjid')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Tetapan Masjid')),
      S.divider(),
      S.listItem()
        .title('Arkib')
        .child(S.documentList().title('Arkib (tidak dipaparkan di laman web)').filter('diarkibkan == true')),
    ]);

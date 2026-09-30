import { defineField, defineType } from 'sanity';
import { ORG_GROUPS, titleOf } from './lists';

// One position on the organisation chart (plan 4.5, D-35). Names are never typed into free text blocks.
export const jawatan = defineType({
  name: 'jawatan',
  title: 'Jawatan',
  type: 'document',
  fields: [
    defineField({
      name: 'jawatan',
      title: 'Jawatan',
      description: 'Contoh: Pengerusi, Setiausaha, Imam',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kumpulan',
      title: 'Kumpulan',
      type: 'string',
      options: { list: ORG_GROUPS, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'biro', title: 'Biro / portfolio (jika ada)', type: 'string' }),
    defineField({
      name: 'kosong',
      title: 'Jawatan kosong',
      description: 'Tandakan jika belum diisi. Laman web akan memaparkan "Jawatan kosong".',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'nama',
      title: 'Nama penyandang',
      type: 'string',
      hidden: ({ document }) => Boolean(document?.kosong),
      validation: (rule) =>
        rule.custom((value, { document }) =>
          document?.kosong || value ? true : 'Sila isi nama, atau tandakan jawatan kosong.',
        ),
    }),
    defineField({
      name: 'gambar',
      title: 'Gambar (pilihan)',
      type: 'gambar',
      hidden: ({ document }) => Boolean(document?.kosong),
    }),
    defineField({
      name: 'kebenaranGambar',
      title: 'Penyandang telah memberi kebenaran untuk gambar ini dipaparkan',
      description: 'Wajib jika ada gambar (D-72).',
      type: 'boolean',
      hidden: ({ document }) => !document?.gambar,
      validation: (rule) =>
        rule.custom((value, { document }) =>
          !document?.gambar || value === true
            ? true
            : 'Gambar hanya boleh diterbitkan dengan kebenaran penyandang.',
        ),
    }),
    defineField({
      name: 'susunan',
      title: 'Susunan dalam kumpulan',
      description: 'Nombor kecil dipaparkan dahulu. Contoh: Pengerusi = 1',
      type: 'number',
      initialValue: 10,
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Kumpulan, kemudian susunan',
      name: 'kumpulanSusunan',
      by: [
        { field: 'kumpulan', direction: 'asc' },
        { field: 'susunan', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: { jawatan: 'jawatan', nama: 'nama', kosong: 'kosong', kumpulan: 'kumpulan', media: 'gambar' },
    prepare: ({ jawatan, nama, kosong, kumpulan, media }) => ({
      title: jawatan,
      subtitle: `${kosong ? 'Jawatan kosong' : (nama ?? '')} · ${titleOf(ORG_GROUPS, kumpulan)}`,
      media,
    }),
  },
});

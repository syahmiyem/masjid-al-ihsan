import { defineField, defineType } from 'sanity';
import { arkibField } from './objects/arkib';

// Speakers chosen from a list (searchable dropdown) on kuliah, activities and guest-speaker changes,
// instead of retyping names. Photo shown on the website and share images — only with consent (D-72).
export const penceramah = defineType({
  name: 'penceramah',
  title: 'Penceramah',
  type: 'document',
  fields: [
    defineField({
      name: 'nama',
      title: 'Nama penuh dengan gelaran',
      description: 'Seperti yang mahu dipaparkan. Contoh: Ustaz Ahmad bin Ali',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'keterangan',
      title: 'Keterangan ringkas (pilihan)',
      description: 'Satu baris. Contoh: Imam Masjid Al-Ihsan, atau Pensyarah UIAM Kuantan',
      type: 'string',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'gambar',
      title: 'Gambar (pilihan)',
      description:
        'Gambar wajah yang jelas. Klik "Edit" untuk memilih bahagian wajah supaya dipotong dengan betul.',
      type: 'gambar',
    }),
    defineField({
      name: 'kebenaranGambar',
      title: 'Penceramah telah memberi kebenaran untuk gambar ini dipaparkan',
      description: 'Wajib jika ada gambar. Tanpa kebenaran, laman web memaparkan huruf awal nama sahaja.',
      type: 'boolean',
      hidden: ({ document }) => !document?.gambar,
      validation: (rule) =>
        rule.custom((value, { document }) =>
          !document?.gambar || value === true
            ? true
            : 'Gambar hanya boleh diterbitkan dengan kebenaran penceramah.',
        ),
    }),
    arkibField,
  ],
  orderings: [{ title: 'Nama', name: 'nama', by: [{ field: 'nama', direction: 'asc' }] }],
  preview: { select: { title: 'nama', subtitle: 'keterangan', media: 'gambar' } },
});

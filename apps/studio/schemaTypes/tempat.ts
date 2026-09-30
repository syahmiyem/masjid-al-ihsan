import { defineField, defineType } from 'sanity';

// Venues within the mosque, used as a dropdown by activities and kuliah (plan 7.2).
export const tempat = defineType({
  name: 'tempat',
  title: 'Tempat',
  type: 'document',
  fields: [
    defineField({
      name: 'nama',
      title: 'Nama tempat',
      description: 'Contoh: Dewan Solat Utama, Dewan Serbaguna',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: 'nama' } },
});

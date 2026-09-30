import { defineField, defineType } from 'sanity';

// Image with required Malay alt text (WCAG 1.1.1; plan 5.2).
export const gambar = defineType({
  name: 'gambar',
  title: 'Gambar',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Penerangan gambar (untuk pembaca skrin)',
      description:
        'Terangkan apa yang ada dalam gambar. Contoh: "Dewan akad nikah dengan susunan kerusi untuk 50 tetamu"',
      type: 'string',
      validation: (rule) => rule.required().error('Sila isi penerangan gambar.'),
    }),
  ],
});

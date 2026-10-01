import { defineArrayMember, defineField, defineType } from 'sanity';
import { LockedSlugInput } from '../components/LockedSlugInput';
import { arkibField } from './objects/arkib';

// One service = one SEO page (plan 4.3, D-60). Structured fields only, so layout can't break (plan 7.5).
export const perkhidmatan = defineType({
  name: 'perkhidmatan',
  title: 'Khidmat',
  type: 'document',
  groups: [
    { name: 'utama', title: 'Utama', default: true },
    { name: 'butiran', title: 'Butiran' },
    { name: 'tempahan', title: 'Tempahan & Hubungi' },
    { name: 'soalan', title: 'Soalan Lazim' },
  ],
  fields: [
    defineField({
      name: 'nama',
      title: 'Nama khidmat',
      description: 'Contoh: Dewan Akad Nikah',
      type: 'string',
      group: 'utama',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Pautan (URL)',
      description: 'Contoh: dewan-akad-nikah. Jangan ubah selepas diterbitkan — penting untuk carian Google.',
      type: 'slug',
      components: { input: LockedSlugInput },
      options: { source: 'nama', maxLength: 60 },
      group: 'utama',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ringkasan',
      title: 'Ringkasan satu ayat',
      description: 'Dipaparkan pada kad khidmat dan hasil carian Google (maksimum 160 aksara).',
      type: 'string',
      group: 'utama',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'gambar',
      title: 'Gambar (3 hingga 8)',
      type: 'array',
      of: [defineArrayMember({ type: 'gambar' })],
      group: 'utama',
      validation: (rule) => [
        rule.max(8),
        // A warning only: fewer photos are allowed, just not recommended
        rule
          .custom((value) => (!value || value.length >= 3 ? true : 'Disyorkan sekurang-kurangnya 3 gambar.'))
          .warning(),
      ],
    }),
    defineField({
      name: 'susunan',
      title: 'Susunan paparan',
      description: 'Nombor kecil dipaparkan dahulu.',
      type: 'number',
      group: 'utama',
      initialValue: 10,
    }),
    defineField({
      name: 'penerangan',
      title: 'Penerangan',
      description: '2 hingga 4 perenggan pendek dalam bahasa mudah.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Biasa', value: 'normal' }],
          lists: [{ title: 'Senarai', value: 'bullet' }],
          marks: { decorators: [{ title: 'Tebal', value: 'strong' }], annotations: [] },
        }),
      ],
      group: 'butiran',
    }),
    defineField({
      name: 'kemudahan',
      title: 'Kemudahan disediakan',
      description: 'Satu kemudahan setiap baris. Contoh: Sistem PA, Kerusi 100 buah, Dapur',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'butiran',
    }),
    defineField({
      name: 'kapasiti',
      title: 'Kapasiti',
      description: 'Contoh: "Sehingga 150 orang"',
      type: 'string',
      group: 'butiran',
    }),
    defineField({
      name: 'kadar',
      title: 'Kadar / Sumbangan',
      type: 'object',
      group: 'butiran',
      fields: [
        defineField({
          name: 'cara',
          title: 'Cara paparan',
          type: 'string',
          options: {
            list: [
              { title: 'Kadar tepat', value: 'tepat' },
              { title: 'Bermula dari', value: 'bermula' },
              { title: 'Sila hubungi kami', value: 'hubungi' },
            ],
            layout: 'radio',
          },
          initialValue: 'hubungi',
        }),
        defineField({
          name: 'jumlah',
          title: 'Jumlah (RM)',
          type: 'number',
          hidden: ({ parent }) => !parent?.cara || parent.cara === 'hubungi',
          validation: (rule) => rule.min(0),
        }),
        defineField({
          name: 'nota',
          title: 'Nota',
          description: 'Contoh: "sehari", "termasuk pembersihan"',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'syarat',
      title: 'Syarat & peraturan',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'butiran',
    }),
    defineField({
      name: 'caraTempah',
      title: 'Cara menempah (langkah demi langkah)',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'tempahan',
    }),
    defineField({
      name: 'hubungi',
      title: 'Hubungi (jawatan)',
      description: 'Contoh: "Pengurus Dewan" — tidak semestinya nama peribadi.',
      type: 'string',
      group: 'tempahan',
    }),
    defineField({
      name: 'whatsapp',
      title: 'Nombor WhatsApp untuk khidmat ini',
      description: 'Kosongkan untuk menggunakan nombor WhatsApp masjid. Format 60xxxxxxxxx.',
      type: 'string',
      group: 'tempahan',
      validation: (rule) =>
        rule.custom(
          (value) => !value || /^60\d{8,10}$/.test(value) || 'Gunakan format 60xxxxxxxxx tanpa ruang.',
        ),
    }),
    defineField({
      name: 'soalanLazim',
      title: 'Soalan lazim',
      description: '3 hingga 6 soalan. Membantu jemaah dan carian Google.',
      type: 'array',
      group: 'soalan',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'soalan',
          fields: [
            defineField({
              name: 'soalan',
              title: 'Soalan',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'jawapan',
              title: 'Jawapan',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'soalan', subtitle: 'jawapan' } },
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    { ...arkibField, group: 'utama' },
  ],
  orderings: [{ title: 'Susunan paparan', name: 'susunan', by: [{ field: 'susunan', direction: 'asc' }] }],
  preview: { select: { title: 'nama', subtitle: 'ringkasan', media: 'gambar.0' } },
});

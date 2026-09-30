import { defineField, defineType } from 'sanity';
import { ACTIVITY_STATUSES, AUDIENCES, CATEGORIES, titleOf } from './lists';

// One-off activity on the monthly calendar (plan 4.1). Recurring kuliah use kuliahSiri instead.
export const aktiviti = defineType({
  name: 'aktiviti',
  title: 'Aktiviti',
  type: 'document',
  fields: [
    defineField({
      name: 'tajuk',
      title: 'Tajuk',
      description: 'Ringkas dan jelas. Contoh: Gotong-royong Perdana Sambut Ramadan',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Pautan (URL)',
      description:
        'Dijana daripada tajuk. Jangan ubah selepas diterbitkan — pautan yang telah dikongsi akan rosak.',
      type: 'slug',
      options: { source: 'tajuk', maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tarikhMula',
      title: 'Tarikh',
      type: 'date',
      options: { dateFormat: 'D MMMM YYYY' },
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return true;
          const today = new Date().toISOString().slice(0, 10);
          return value >= today || { message: 'Tarikh ini telah berlalu.', level: 'warning' as const };
        }),
    }),
    defineField({
      name: 'tarikhTamat',
      title: 'Tarikh tamat (jika lebih sehari)',
      type: 'date',
      options: { dateFormat: 'D MMMM YYYY' },
      validation: (rule) =>
        rule.custom((value, { document }) => {
          const mula = document?.tarikhMula as string | undefined;
          return !value || !mula || value >= mula || 'Tarikh tamat mesti selepas tarikh mula.';
        }),
    }),
    defineField({ name: 'masa', title: 'Masa', type: 'masa', validation: (rule) => rule.required() }),
    defineField({
      name: 'tempat',
      title: 'Tempat',
      type: 'reference',
      to: [{ type: 'tempat' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kategori',
      title: 'Kategori',
      type: 'string',
      options: { list: CATEGORIES },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sasaran',
      title: 'Sasaran',
      type: 'string',
      options: { list: AUDIENCES, layout: 'radio', direction: 'horizontal' },
      initialValue: 'umum',
    }),
    defineField({ name: 'penceramah', title: 'Penceramah / Penganjur', type: 'string' }),
    defineField({ name: 'penerangan', title: 'Penerangan', type: 'text', rows: 4 }),
    defineField({
      name: 'poster',
      title: 'Poster (pilihan)',
      description: 'Jika kosong, laman web akan menjana kad secara automatik.',
      type: 'gambar',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ACTIVITY_STATUSES, layout: 'radio' },
      initialValue: 'dijadualkan',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tarikhBaharu',
      title: 'Tarikh baharu',
      type: 'date',
      options: { dateFormat: 'D MMMM YYYY' },
      hidden: ({ document }) => document?.status !== 'ditangguhkan',
    }),
    defineField({
      name: 'notaPerubahan',
      title: 'Nota perubahan',
      description: 'Dipaparkan dengan jelas kepada jemaah. Contoh: "Ditangguhkan kerana cuti umum."',
      type: 'string',
      hidden: ({ document }) => !document?.status || document.status === 'dijadualkan',
      validation: (rule) =>
        rule.custom((value, { document }) =>
          !document?.status || document.status === 'dijadualkan' || value
            ? true
            : 'Sila terangkan perubahan untuk jemaah.',
        ),
    }),
  ],
  orderings: [
    {
      title: 'Tarikh (terkini dahulu)',
      name: 'tarikhDesc',
      by: [{ field: 'tarikhMula', direction: 'desc' }],
    },
  ],
  preview: {
    select: { tajuk: 'tajuk', tarikh: 'tarikhMula', status: 'status', media: 'poster' },
    prepare: ({ tajuk, tarikh, status, media }) => ({
      title: tajuk,
      subtitle: [
        tarikh,
        status && status !== 'dijadualkan' ? titleOf(ACTIVITY_STATUSES, status).toUpperCase() : '',
      ]
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
});

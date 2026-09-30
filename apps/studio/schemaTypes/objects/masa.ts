import { defineField, defineType } from 'sanity';
import { PRAYER_RELATIVE, titleOf } from '../lists';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

// Time of an activity or kuliah: either a clock time or relative to a prayer (D-12, assumption A8).
export const masa = defineType({
  name: 'masa',
  title: 'Masa',
  type: 'object',
  fields: [
    defineField({
      name: 'jenis',
      title: 'Jenis masa',
      type: 'string',
      options: {
        list: [
          { title: 'Jam tertentu (contoh 8:30 malam)', value: 'jam' },
          { title: 'Berdasarkan waktu solat (contoh Selepas Maghrib)', value: 'solat' },
        ],
        layout: 'radio',
      },
      initialValue: 'solat',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'jam',
      title: 'Jam',
      description: 'Format 24 jam. Contoh: 20:30 untuk 8:30 malam',
      type: 'string',
      hidden: ({ parent }) => parent?.jenis !== 'jam',
      validation: (rule) =>
        rule.custom((value, { parent }) => {
          if ((parent as { jenis?: string })?.jenis !== 'jam') return true;
          if (!value) return 'Sila isi jam.';
          return HHMM.test(value) || 'Gunakan format 24 jam, contoh 20:30.';
        }),
    }),
    defineField({
      name: 'waktuSolat',
      title: 'Waktu solat',
      type: 'string',
      options: { list: PRAYER_RELATIVE },
      hidden: ({ parent }) => parent?.jenis !== 'solat',
      validation: (rule) =>
        rule.custom((value, { parent }) =>
          (parent as { jenis?: string })?.jenis !== 'solat' || value ? true : 'Sila pilih waktu solat.',
        ),
    }),
    defineField({
      name: 'jamTamat',
      title: 'Jam tamat (jika ada)',
      description: 'Pilihan. Format 24 jam, contoh 22:00',
      type: 'string',
      validation: (rule) =>
        rule.custom((value) => !value || HHMM.test(value) || 'Gunakan format 24 jam, contoh 22:00.'),
    }),
  ],
  preview: {
    select: { jenis: 'jenis', jam: 'jam', waktuSolat: 'waktuSolat' },
    prepare: ({ jenis, jam, waktuSolat }) => ({
      title: jenis === 'jam' ? jam : titleOf(PRAYER_RELATIVE, waktuSolat),
    }),
  },
});

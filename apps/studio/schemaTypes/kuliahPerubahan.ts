import { defineField, defineType } from 'sanity';
import { arkibField } from './objects/arkib';

const TYPES = [
  { title: 'Dibatalkan', value: 'dibatalkan' },
  { title: 'Ditangguhkan ke tarikh lain', value: 'ditangguhkan' },
  { title: 'Penceramah jemputan', value: 'penceramah-jemputan' },
  { title: 'Tukar tempat', value: 'tukar-tempat' },
  { title: 'Tukar masa', value: 'tukar-masa' },
];

// A change to one date of a kuliah series (plan 4.2, journey J5).
export const kuliahPerubahan = defineType({
  name: 'kuliahPerubahan',
  title: 'Perubahan Kuliah',
  type: 'document',
  fields: [
    defineField({
      name: 'siri',
      title: 'Siri kuliah',
      type: 'reference',
      to: [{ type: 'kuliahSiri' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tarikh',
      title: 'Tarikh kuliah yang terlibat',
      type: 'date',
      options: { dateFormat: 'D MMMM YYYY' },
      validation: (rule) =>
        rule.required().custom(async (value, { document, getClient }) => {
          const siri = (document?.siri as { _ref?: string } | undefined)?._ref;
          if (!value || !siri) return true;
          const id = (document?._id ?? '').replace(/^drafts\./, '');
          const count = await getClient({ apiVersion: '2025-02-19' }).fetch<number>(
            'count(*[_type == "kuliahPerubahan" && siri._ref == $siri && tarikh == $tarikh && !(_id in [$id, "drafts." + $id])])',
            { siri, tarikh: value, id },
          );
          return (
            count === 0 || {
              message: 'Sudah ada perubahan lain untuk tarikh ini.',
              level: 'warning' as const,
            }
          );
        }),
    }),
    defineField({
      name: 'jenis',
      title: 'Jenis perubahan',
      type: 'string',
      options: { list: TYPES, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tarikhBaharu',
      title: 'Tarikh baharu',
      type: 'date',
      options: { dateFormat: 'D MMMM YYYY' },
      hidden: ({ document }) => document?.jenis !== 'ditangguhkan',
      validation: (rule) =>
        rule.custom((value, { document }) =>
          document?.jenis !== 'ditangguhkan' || value ? true : 'Sila pilih tarikh baharu.',
        ),
    }),
    defineField({
      name: 'penceramahJemputan',
      title: 'Penceramah jemputan',
      description: 'Pilih daripada senarai, atau tekan "Create" untuk menambah penceramah baharu.',
      type: 'reference',
      to: [{ type: 'penceramah' }],
      options: { filter: 'diarkibkan != true' },
      hidden: ({ document }) => document?.jenis !== 'penceramah-jemputan',
      validation: (rule) =>
        rule.custom((value, { document }) =>
          document?.jenis !== 'penceramah-jemputan' || value ? true : 'Sila pilih penceramah jemputan.',
        ),
    }),
    defineField({
      name: 'tempatBaharu',
      title: 'Tempat baharu',
      type: 'reference',
      to: [{ type: 'tempat' }],
      hidden: ({ document }) => document?.jenis !== 'tukar-tempat',
      validation: (rule) =>
        rule.custom((value, { document }) =>
          document?.jenis !== 'tukar-tempat' || value ? true : 'Sila pilih tempat baharu.',
        ),
    }),
    defineField({
      name: 'masaBaharu',
      title: 'Masa baharu',
      type: 'masa',
      hidden: ({ document }) => document?.jenis !== 'tukar-masa',
      validation: (rule) =>
        rule.custom((value, { document }) =>
          document?.jenis !== 'tukar-masa' || value ? true : 'Sila isi masa baharu.',
        ),
    }),
    defineField({
      name: 'sebab',
      title: 'Sebab / nota untuk jemaah',
      description: 'Contoh: "Penceramah uzur." Dipaparkan di laman web.',
      type: 'string',
    }),
    arkibField,
  ],
  preview: {
    select: { siri: 'siri.nama', tarikh: 'tarikh', jenis: 'jenis' },
    prepare: ({ siri, tarikh, jenis }) => ({
      title: `${siri ?? 'Kuliah'} — ${tarikh ?? ''}`,
      subtitle: TYPES.find((t) => t.value === jenis)?.title,
    }),
  },
});

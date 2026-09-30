import { defineField, defineType } from 'sanity';
import { AUDIENCES, WEEKDAYS, titleOf } from './lists';

// A recurring kuliah defined once by a rule (D-11, plan 4.2). Individual changes go in kuliahPerubahan.
export const kuliahSiri = defineType({
  name: 'kuliahSiri',
  title: 'Siri Kuliah',
  type: 'document',
  fields: [
    defineField({
      name: 'nama',
      title: 'Nama siri',
      description: 'Contoh: Kuliah Maghrib Mingguan',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Pautan (URL)',
      description: 'Dijana daripada nama. Jangan ubah selepas diterbitkan.',
      type: 'slug',
      options: { source: 'nama', maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'jenis',
      title: 'Kekerapan',
      type: 'string',
      options: {
        list: [
          { title: 'Setiap minggu', value: 'mingguan' },
          { title: 'Sebulan sekali', value: 'bulanan' },
        ],
        layout: 'radio',
      },
      initialValue: 'mingguan',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hari',
      title: 'Hari',
      type: 'string',
      options: { list: WEEKDAYS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mingguKe',
      title: 'Minggu ke berapa dalam bulan',
      description: 'Contoh: "Pertama" + Isnin = Isnin pertama setiap bulan',
      type: 'string',
      options: {
        list: [
          { title: 'Pertama', value: '1' },
          { title: 'Kedua', value: '2' },
          { title: 'Ketiga', value: '3' },
          { title: 'Keempat', value: '4' },
          { title: 'Terakhir', value: 'terakhir' },
        ],
      },
      hidden: ({ document }) => document?.jenis !== 'bulanan',
      validation: (rule) =>
        rule.custom((value, { document }) =>
          document?.jenis !== 'bulanan' || value ? true : 'Sila pilih minggu ke berapa.',
        ),
    }),
    defineField({ name: 'masa', title: 'Masa', type: 'masa', validation: (rule) => rule.required() }),
    defineField({
      name: 'tempat',
      title: 'Tempat',
      type: 'reference',
      to: [{ type: 'tempat' }],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'penceramah', title: 'Penceramah biasa', type: 'string' }),
    defineField({ name: 'topik', title: 'Topik / Kitab', type: 'string' }),
    defineField({
      name: 'sasaran',
      title: 'Sasaran',
      type: 'string',
      options: { list: AUDIENCES, layout: 'radio', direction: 'horizontal' },
      initialValue: 'umum',
    }),
    defineField({
      name: 'aktifDari',
      title: 'Aktif dari',
      type: 'date',
      options: { dateFormat: 'D MMMM YYYY' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aktifHingga',
      title: 'Aktif hingga (jika ada)',
      description: 'Kosongkan jika berterusan. Untuk rehat Ramadan, gunakan "Perubahan" bagi setiap tarikh.',
      type: 'date',
      options: { dateFormat: 'D MMMM YYYY' },
      validation: (rule) =>
        rule.custom((value, { document }) => {
          const dari = document?.aktifDari as string | undefined;
          return !value || !dari || value >= dari || 'Tarikh akhir mesti selepas tarikh mula.';
        }),
    }),
    defineField({ name: 'penerangan', title: 'Penerangan', type: 'text', rows: 3 }),
  ],
  preview: {
    select: { nama: 'nama', jenis: 'jenis', hari: 'hari', mingguKe: 'mingguKe', penceramah: 'penceramah' },
    prepare: ({ nama, jenis, hari, mingguKe, penceramah }) => {
      const day = titleOf(WEEKDAYS, hari);
      const when =
        jenis === 'bulanan'
          ? `${day} ${mingguKe === 'terakhir' ? 'terakhir' : `minggu ke-${mingguKe}`} setiap bulan`
          : `Setiap ${day}`;
      return { title: nama, subtitle: [when, penceramah].filter(Boolean).join(' · ') };
    },
  },
});

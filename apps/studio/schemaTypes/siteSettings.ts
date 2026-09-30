import { defineField, defineType } from 'sanity';

// Singleton: mosque identity and contact details (plan 7.2, "Tetapan Masjid" — Pentadbir only).
// Waktu Solat and Derma are deliberately NOT here (plan 4.8, 4.9).
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Tetapan Masjid',
  type: 'document',
  fields: [
    defineField({
      name: 'officialName',
      title: 'Nama rasmi masjid',
      description: 'Contoh: Masjid Al-Ihsan Felda Sungai Panching Selatan',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'address',
      title: 'Alamat penuh',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mapUrl',
      title: 'Pautan Google Maps',
      type: 'url',
    }),
    defineField({
      name: 'phone',
      title: 'Nombor telefon pejabat',
      description: 'Contoh: 09-123 4567',
      type: 'string',
    }),
    defineField({
      name: 'whatsapp',
      title: 'Nombor WhatsApp masjid',
      description: 'Dengan kod negara, tanpa ruang. Contoh: 60123456789',
      type: 'string',
      validation: (rule) =>
        rule
          .regex(/^60\d{8,10}$/, { name: 'nombor WhatsApp', invert: false })
          .warning('Gunakan format 60xxxxxxxxx tanpa ruang atau tanda sempang.'),
    }),
    defineField({
      name: 'officeHours',
      title: 'Waktu pejabat',
      type: 'string',
    }),
  ],
  preview: { prepare: () => ({ title: 'Tetapan Masjid' }) },
});

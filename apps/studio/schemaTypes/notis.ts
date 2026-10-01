import { defineField, defineType } from 'sanity';
import { arkibField } from './objects/arkib';

// Banner for urgent changes on the home page (plan 3.3, D-18).
export const notis = defineType({
  name: 'notis',
  title: 'Notis Penting',
  type: 'document',
  fields: [
    defineField({
      name: 'mesej',
      title: 'Mesej',
      description: 'Ringkas. Contoh: "Kuliah Maghrib Isnin ini dibatalkan."',
      type: 'string',
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: 'tahap',
      title: 'Tahap',
      type: 'string',
      options: {
        list: [
          { title: 'Makluman', value: 'makluman' },
          { title: 'Penting', value: 'penting' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'makluman',
    }),
    defineField({
      name: 'paparDari',
      title: 'Papar dari',
      type: 'datetime',
      options: { dateFormat: 'D MMMM YYYY', timeFormat: 'h:mm a' },
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'paparHingga',
      title: 'Papar hingga',
      description: 'Notis akan hilang secara automatik selepas tarikh ini.',
      type: 'datetime',
      options: { dateFormat: 'D MMMM YYYY', timeFormat: 'h:mm a' },
      validation: (rule) =>
        rule.required().custom((value, { document }) => {
          const dari = document?.paparDari as string | undefined;
          return !value || !dari || value > dari || 'Mesti selepas "Papar dari".';
        }),
    }),
    defineField({
      name: 'pautan',
      title: 'Pautan (pilihan)',
      description: 'Contoh: /kuliah',
      type: 'string',
    }),
    arkibField,
  ],
  preview: { select: { title: 'mesej', subtitle: 'paparHingga' } },
});

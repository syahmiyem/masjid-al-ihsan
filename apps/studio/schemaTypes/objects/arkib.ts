import { defineField } from 'sanity';

// Archive instead of delete (plan 7.5, D-26): editors hide items from the website; only a Pentadbir
// can delete permanently. Archived items move to the "Arkib" list in the Studio.
export const arkibField = defineField({
  name: 'diarkibkan',
  title: 'Arkibkan (sembunyikan daripada laman web)',
  description:
    'Gunakan ini dan bukannya memadam. Item akan hilang dari laman web tetapi boleh dipulihkan dari senarai "Arkib".',
  type: 'boolean',
  initialValue: false,
});

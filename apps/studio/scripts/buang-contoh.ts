// Removes all CONTOH sample content (IDs starting "contoh-") — docs/plan.md Phase 5.
// Tetapan Masjid (siteSettings) is not deleted; overwrite it with real details in the Studio.
//
//   pnpm contoh:buang                               → production
//   SANITY_STUDIO_DATASET=latihan pnpm contoh:buang → practice dataset

import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2025-02-19' });
const ids = await client.fetch<string[]>(
  '*[string::startsWith(_id, "contoh-") || string::startsWith(_id, "drafts.contoh-")]._id',
);
// Delete documents that others reference last (references must go first)
const order = ['perubahan', 'aktiviti', 'kuliah', 'kelas', 'perkhidmatan', 'jawatan', 'notis', 'tempat'];
const rank = (id: string) => order.findIndex((p) => id.replace(/^drafts\./, '').startsWith(`contoh-${p}`));
ids.sort((a, b) => rank(a) - rank(b));
const tx = client.transaction();
for (const id of ids) tx.delete(id);
if (ids.length) await tx.commit();
console.log(`Dataset "${client.config().dataset}": ${ids.length} CONTOH documents removed.`);

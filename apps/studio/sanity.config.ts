import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { SINGLETONS, schemaTypes } from './schemaTypes';
import { structure } from './structure';

// Project ID is public (it appears in every API request), so it is the default here.
// Override with SANITY_STUDIO_PROJECT_ID / SANITY_STUDIO_DATASET, e.g. to use the "latihan" dataset.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '1xd617ey';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'Masjid Al-Ihsan — Pentadbiran',
  projectId,
  dataset,
  plugins: [structureTool({ title: 'Kandungan', structure })],
  schema: {
    types: schemaTypes,
    // Singletons can't be created from the "+" menu
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.has(schemaType)),
  },
  document: {
    // Singletons can only be published, discarded or restored — never duplicated or deleted
    actions: (actions, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? actions.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
  },
});

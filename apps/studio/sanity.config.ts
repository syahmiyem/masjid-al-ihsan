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
    actions: (actions, { schemaType, currentUser }) => {
      // Singletons can only be published, discarded or restored — never duplicated or deleted
      if (SINGLETONS.has(schemaType)) {
        return actions.filter(
          ({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action),
        );
      }
      // Archive instead of delete (plan 7.5, D-26): only a Pentadbir (administrator) can delete permanently
      const isAdmin = currentUser?.roles?.some((r) => r.name === 'administrator');
      return isAdmin ? actions : actions.filter(({ action }) => action !== 'delete');
    },
  },
});

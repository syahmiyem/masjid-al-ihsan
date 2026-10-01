import { defineConfig, type WorkspaceOptions } from 'sanity';
import { structureTool } from 'sanity/structure';
import { SINGLETONS, schemaTypes } from './schemaTypes';
import { structure } from './structure';

// Project ID is public (it appears in every API request), so it is the default here.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '1xd617ey';

const shared: Omit<WorkspaceOptions, 'name' | 'title' | 'basePath' | 'dataset'> = {
  projectId,
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
};

// Two workspaces (plan 7.6): the real website content, and a practice copy that never reaches the site
// (the "latihan" dataset has no webhook, so nothing is rebuilt or published from it).
export default defineConfig([
  {
    ...shared,
    name: 'kandungan',
    title: 'Laman Web Masjid (sebenar)',
    subtitle: 'Kandungan yang dipaparkan di laman web',
    basePath: '/kandungan',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  {
    ...shared,
    name: 'latihan',
    title: 'Latihan (praktis sahaja)',
    subtitle: 'Tidak dipaparkan di laman web — selamat untuk mencuba',
    basePath: '/latihan',
    dataset: 'latihan',
  },
]);

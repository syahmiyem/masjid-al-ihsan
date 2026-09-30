import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';
import { structure } from './structure';

// Set in apps/studio/.env (SANITY_STUDIO_*) locally, or as CI variables. See .env.example.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'replace-me';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'Masjid Al-Ihsan — Pentadbiran',
  projectId,
  dataset,
  plugins: [structureTool({ title: 'Kandungan', structure })],
  schema: { types: schemaTypes },
});

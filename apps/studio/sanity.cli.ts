import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '1xd617ey',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Hosted at https://<studioHost>.sanity.studio (plan 9.6)
  studioHost: process.env.SANITY_STUDIO_HOST || 'masjid-al-ihsan',
  deployment: { autoUpdates: true },
});

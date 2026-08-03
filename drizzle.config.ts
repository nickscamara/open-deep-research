import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

import { getDatabaseUrl } from './lib/db/config';

config({
  path: '.env.local',
});

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl(process.env),
  },
});

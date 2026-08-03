import assert from 'node:assert/strict';
import test from 'node:test';

import { getDatabaseUrl } from './config';

test('prefers DATABASE_URL when both database env vars are set', () => {
  const databaseUrl = getDatabaseUrl({
    DATABASE_URL: 'postgres://preferred',
    POSTGRES_URL: 'postgres://legacy',
  });

  assert.equal(databaseUrl, 'postgres://preferred');
});

test('falls back to POSTGRES_URL when DATABASE_URL is missing', () => {
  const databaseUrl = getDatabaseUrl({
    POSTGRES_URL: 'postgres://legacy',
  });

  assert.equal(databaseUrl, 'postgres://legacy');
});

test('throws when neither DATABASE_URL nor POSTGRES_URL is configured', () => {
  assert.throws(() => getDatabaseUrl({}), {
    message: 'DATABASE_URL or POSTGRES_URL must be defined',
  });
});

type DatabaseEnv = Record<string, string | undefined>;

export function getDatabaseUrl(env: DatabaseEnv = process.env): string {
  const databaseUrl = env.DATABASE_URL?.trim() || env.POSTGRES_URL?.trim();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL must be defined');
  }

  return databaseUrl;
}

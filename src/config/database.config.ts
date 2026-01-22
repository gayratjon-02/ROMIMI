// src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in .env file');
  }

  const isSupabase = databaseUrl.includes('supabase');

  return {
    type: 'postgres' as const,
    url: databaseUrl,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    retryAttempts: 5,
    retryDelay: 3000,
    connectTimeoutMS: 10000,
  };
});

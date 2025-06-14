import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
}

// Configure Neon for serverless environments
// Connection caching is enabled by default in newer versions

// Create connection pool for serverless
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Serverless optimizations
    max: 1, // Single connection for serverless
    idleTimeoutMillis: 0, // Prevent idle timeout
    connectionTimeoutMillis: 5000, // 5 second timeout
});

// Create drizzle instance with Neon serverless adapter
export const db = drizzle(pool, { schema });

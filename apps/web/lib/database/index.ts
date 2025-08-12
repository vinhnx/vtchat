import { neon } from '@neondatabase/serverless';
import { log } from '@repo/shared/logger';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
}

// Use Neon HTTP client instead of Pool for better Bun compatibility
// This avoids the unref() function issues with connection pooling
const sql = neon(process.env.DATABASE_URL);

// Create drizzle instance with Neon HTTP adapter (more compatible with Bun)
export const db = drizzle(sql, {
    schema,
    // Disable drizzle's built-in logger to prevent connection object dumps
    logger: false,
});

// Simple connection test function
export const testConnection = async () => {
    try {
        await sql`SELECT 1`;
        log.info({}, 'Database connection test successful');
        return true;
    } catch (error) {
        log.error(
            { error: error instanceof Error ? error.message : String(error) },
            'Database connection test failed',
        );
        return false;
    }
};

// Helper function to handle database connection errors gracefully
export const withDatabaseErrorHandling = async <T>(
    operation: () => Promise<T>,
    operationName = 'Database operation',
): Promise<T> => {
    try {
        return await operation();
    } catch (error: unknown) {
        const err = error as {
            message?: string;
            code?: string;
            severity?: string;
            detail?: string;
        };
        log.error(
            {
                error: err.message || String(error),
                code: err.code,
                severity: err.severity,
                detail: err.detail,
            },
            `${operationName} failed`,
        );

        // Handle specific Neon/PostgreSQL error codes
        if (err.code === '57P01') {
            throw new Error('Database connection was terminated. Please try again.');
        }
        if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
            throw new Error('Database connection timeout. Please try again.');
        }
        if (err.code === '53300') {
            throw new Error('Too many database connections. Please try again in a moment.');
        }

        // Re-throw original error for other cases
        throw error;
    }
};

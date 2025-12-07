import { neon } from '@neondatabase/serverless';
import { log } from '@repo/shared/logger';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

// Gracefully handle missing env in local/dev to avoid hard crashes
const isDatabaseConfigured = Boolean(databaseUrl);

const sql = isDatabaseConfigured ? neon(databaseUrl!) : null;

// Create drizzle instance only when configured; otherwise export null
export const db = isDatabaseConfigured
    ? drizzle(sql as ReturnType<typeof neon>, {
        schema,
        logger: false,
    })
    : null;

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

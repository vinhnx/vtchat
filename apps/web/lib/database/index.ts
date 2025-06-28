import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';
import { logger } from '@repo/shared/logger';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
}

// Configure Neon for serverless environments with robust error handling
let pool: Pool;

try {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        // Improved serverless optimizations
        max: 3, // Allow more connections for concurrent requests
        min: 0, // Start with no connections
        idleTimeoutMillis: 30000, // 30 seconds idle timeout (prevent indefinite connections)
        connectionTimeoutMillis: 10000, // 10 second connection timeout
        // Add retry and reconnection logic
        allowExitOnIdle: true, // Allow process to exit when idle
        // Enable statement timeout to prevent hanging queries
        statement_timeout: 60000, // 60 seconds
        // Add connection validation
        query_timeout: 60000, // 60 seconds query timeout
    });

    // Add error handling for connection pool
    pool.on('error', (err: Error) => {
        logger.error({ err }, 'Database pool error');
        // Don't throw here to prevent crashing the app
    });

    pool.on('connect', () => {
        logger.info('Database connection established');
    });

    pool.on('remove', () => {
        logger.info('Database connection removed from pool');
    });
} catch (error) {
    logger.error({ error }, 'Failed to create database pool');
    throw new Error('Database connection pool creation failed');
}

// Create drizzle instance with Neon serverless adapter and error handling
export const db = drizzle(pool, {
    schema,
    logger: process.env.NODE_ENV === 'development' ? true : false,
});

// Helper function to handle database connection errors gracefully
export const withDatabaseErrorHandling = async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Database operation'
): Promise<T> => {
    try {
        return await operation();
    } catch (error: any) {
        logger.error({
            error: error.message,
            code: error.code,
            severity: error.severity,
            detail: error.detail,
        }, `${operationName} failed`);

        // Handle specific Neon/PostgreSQL error codes
        if (error.code === '57P01') {
            throw new Error('Database connection was terminated. Please try again.');
        } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            throw new Error('Database connection timeout. Please try again.');
        } else if (error.code === '53300') {
            throw new Error('Too many database connections. Please try again in a moment.');
        }

        // Re-throw original error for other cases
        throw error;
    }
};

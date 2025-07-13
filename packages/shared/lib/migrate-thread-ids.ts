import { generateThreadId, isLegacyThreadId, verifyThreadId } from './thread-id';
import { log } from '../logger';

export interface ThreadMigrationResult {
    totalThreads: number;
    migratedThreads: number;
    errors: string[];
}

/**
 * Migrate legacy thread IDs to legid format
 * This function helps transition from nanoid/uuid to legid
 */
export async function migrateThreadIds(
    getThreads: () => Promise<{ id: string; [key: string]: any }[]>,
    updateThreadId: (oldId: string, newId: string) => Promise<void>
): Promise<ThreadMigrationResult> {
    const result: ThreadMigrationResult = {
        totalThreads: 0,
        migratedThreads: 0,
        errors: [],
    };

    try {
        const threads = await getThreads();
        result.totalThreads = threads.length;

        log.info({ totalThreads: result.totalThreads }, 'Starting thread ID migration');

        for (const thread of threads) {
            try {
                // Skip if already using legid
                if (!isLegacyThreadId(thread.id)) {
                    // Verify it's a valid legid
                    if (verifyThreadId(thread.id)) {
                        log.debug({ threadId: thread.id }, 'Thread already using legid format');
                        continue;
                    } else {
                        log.warn({ threadId: thread.id }, 'Thread has unknown ID format');
                    }
                }

                // Generate new legid
                const newId = await generateThreadId();

                // Update the thread with new ID
                await updateThreadId(thread.id, newId);

                result.migratedThreads++;
                log.info(
                    {
                        oldId: thread.id,
                        newId: newId,
                    },
                    'Migrated thread ID'
                );
            } catch (error) {
                const errorMsg = `Failed to migrate thread ${thread.id}: ${error}`;
                result.errors.push(errorMsg);
                log.error({ error, threadId: thread.id }, 'Thread migration failed');
            }
        }

        log.info(
            {
                totalThreads: result.totalThreads,
                migratedThreads: result.migratedThreads,
                errors: result.errors.length,
            },
            'Thread ID migration completed'
        );
    } catch (error) {
        const errorMsg = `Migration failed: ${error}`;
        result.errors.push(errorMsg);
        log.error({ error }, 'Thread ID migration failed');
    }

    return result;
}

/**
 * Validate all thread IDs in the system
 * Useful for checking migration results
 */
export async function validateThreadIds(
    getThreads: () => Promise<{ id: string; [key: string]: any }[]>
): Promise<{ valid: number; invalid: number; legacy: number }> {
    const threads = await getThreads();
    const result = { valid: 0, invalid: 0, legacy: 0 };

    for (const thread of threads) {
        if (isLegacyThreadId(thread.id)) {
            result.legacy++;
        } else if (verifyThreadId(thread.id)) {
            result.valid++;
        } else {
            result.invalid++;
        }
    }

    return result;
}

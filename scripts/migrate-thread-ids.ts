#!/usr/bin/env bun

/**
 * Migration script to convert existing thread IDs from nanoid/uuid to legid format
 *
 * Usage: bun scripts/migrate-thread-ids.ts
 */

import { ChatStorage } from '../packages/common/store/chat.store';
import { migrateThreadIds, validateThreadIds } from '../packages/shared/lib/migrate-thread-ids';
import { log } from '../packages/shared/logger';

async function main() {
    log.info({}, 'Starting thread ID migration process');

    try {
        // Initialize storage
        const storage = new ChatStorage();
        await storage.open();

        // Get all threads function
        const getThreads = async () => {
            const threads = await storage.threads.toArray();
            return threads;
        };

        // Update thread ID function
        const updateThreadId = async (oldId: string, newId: string) => {
            await storage.transaction('rw', [storage.threads, storage.threadItems], async () => {
                // Get the thread
                const thread = await storage.threads.get(oldId);
                if (!thread) {
                    throw new Error(`Thread not found: ${oldId}`);
                }

                // Update thread with new ID
                const updatedThread = { ...thread, id: newId };
                await storage.threads.delete(oldId);
                await storage.threads.put(updatedThread);

                // Update all thread items to reference new thread ID
                const threadItems = await storage.threadItems
                    .where('threadId')
                    .equals(oldId)
                    .toArray();
                for (const item of threadItems) {
                    const updatedItem = { ...item, threadId: newId };
                    await storage.threadItems.put(updatedItem);
                }

                log.info(
                    {
                        oldId,
                        newId,
                        threadItemsUpdated: threadItems.length,
                    },
                    'Updated thread and related items'
                );
            });
        };

        // Validate current state
        log.info({}, 'Validating current thread IDs...');
        const preValidation = await validateThreadIds(getThreads);
        log.info(preValidation, 'Pre-migration validation results');

        // Run migration
        const migrationResult = await migrateThreadIds(getThreads, updateThreadId);

        // Validate post-migration
        log.info({}, 'Validating migrated thread IDs...');
        const postValidation = await validateThreadIds(getThreads);
        log.info(postValidation, 'Post-migration validation results');

        // Summary
        log.info(
            {
                migration: migrationResult,
                preValidation,
                postValidation,
            },
            'Migration completed successfully'
        );

        if (migrationResult.errors.length > 0) {
            log.warn({ errors: migrationResult.errors }, 'Migration completed with errors');
            process.exit(1);
        }

        await storage.close();
    } catch (error) {
        log.error({ error }, 'Migration failed');
        process.exit(1);
    }
}

if (import.meta.main) {
    main();
}

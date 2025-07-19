#!/usr/bin/env bun

/**
 * Script to migrate existing embeddings content to secure format
 * This script masks PII in existing embeddings
 */

import { log } from "@repo/shared/logger";
import { eq } from "drizzle-orm";
import { db } from "../apps/web/lib/database";
import { embeddings } from "../apps/web/lib/database/schema";
import { secureContentForEmbedding } from "../apps/web/lib/utils/content-security";

async function migrateEmbeddingsContent() {
    try {
        log.info("Starting embeddings content security migration...");

        // Get all embeddings that need to be secured
        const allEmbeddings = await db
            .select({
                id: embeddings.id,
                content: embeddings.content,
            })
            .from(embeddings);

        log.info(`Found ${allEmbeddings.length} embeddings to secure`);

        let processedCount = 0;
        let securedCount = 0;

        // Process in batches to avoid memory issues
        const batchSize = 100;
        for (let i = 0; i < allEmbeddings.length; i += batchSize) {
            const batch = allEmbeddings.slice(i, i + batchSize);

            for (const embedding of batch) {
                const originalContent = embedding.content;
                const securedContent = secureContentForEmbedding(originalContent);

                // Only update if content actually changed (has PII or is too long)
                if (originalContent !== securedContent) {
                    await db
                        .update(embeddings)
                        .set({ content: securedContent })
                        .where(eq(embeddings.id, embedding.id));

                    securedCount++;
                    log.info(`Secured embedding ${embedding.id}`, {
                        originalContent,
                        securedContent,
                    });
                }

                processedCount++;
            }

            log.info(`Processed ${processedCount}/${allEmbeddings.length} embeddings`);
        }

        log.info(
            `Migration completed: ${securedCount} embeddings secured out of ${processedCount} total`,
        );
    } catch (error) {
        log.error("Error during embeddings migration:", error);
        throw error;
    }
}

// Run the migration
if (require.main === module) {
    migrateEmbeddingsContent()
        .then(() => {
            log.info("Embeddings security migration completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            log.error("Migration failed:", error);
            process.exit(1);
        });
}

export { migrateEmbeddingsContent };

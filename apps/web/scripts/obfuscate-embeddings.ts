/**
 * Script to obfuscate existing embeddings content for privacy protection
 * This should be run as a one-time migration to secure existing data
 */

import { log } from '@repo/shared/logger';
import { sql } from 'drizzle-orm';
import { db } from '../lib/database';
import { embeddings } from '../lib/database/schema';
import { containsPII, secureContentForEmbedding } from '../lib/utils/content-security';

interface EmbeddingRecord {
    id: string;
    content: string;
}

async function obfuscateExistingEmbeddings() {
    try {
        // Get all embeddings that might need obfuscation
        const allEmbeddings = await db
            .select({
                id: embeddings.id,
                content: embeddings.content,
            })
            .from(embeddings)
            .where(sql`content NOT LIKE '%_REDACTED%'`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const embedding of allEmbeddings) {
            const originalContent = embedding.content;
            const securedContent = secureContentForEmbedding(originalContent);

            // Only update if content changed (was obfuscated)
            if (originalContent !== securedContent) {
                await db
                    .update(embeddings)
                    .set({
                        content: securedContent,
                    })
                    .where(sql`id = ${embedding.id}`);

                updatedCount++;

                log.info(
                    {
                        embeddingId: embedding.id,
                        hadPII: containsPII(originalContent),
                        originalLength: originalContent.length,
                        securedLength: securedContent.length,
                    },
                    'Obfuscated embedding content'
                );
            } else {
                skippedCount++;
            }
        }

        console.log('✅ Obfuscation complete!');
        console.log(`   Updated: ${updatedCount} embeddings`);
        console.log(`   Skipped: ${skippedCount} embeddings (no PII detected)`);

        // Verify the obfuscation
        console.log('\n🔍 Verifying obfuscation...');
        await verifyObfuscation();
    } catch (error) {
        console.error('❌ Error during obfuscation:', error);
        log.error({ error }, 'Failed to obfuscate embeddings');
        throw error;
    }
}

async function verifyObfuscation() {
    // Check for any remaining potentially sensitive content
    const sensitivePatterns = [
        { pattern: /my name is [A-Z][a-z]+/i, type: 'NAME' },
        { pattern: /I am \d+ years old/i, type: 'AGE' },
        { pattern: /born in \d{4}/i, type: 'BIRTH_YEAR' },
        { pattern: /meeting.*with.*(?!REDACTED)/i, type: 'MEETING' },
    ];

    let issuesFound = 0;

    for (const { pattern, type } of sensitivePatterns) {
        const results = await db
            .select({
                id: embeddings.id,
                content: embeddings.content,
            })
            .from(embeddings)
            .where(sql`content ~ ${pattern.source}`);

        if (results.length > 0) {
            console.log(`⚠️  Found ${results.length} embeddings with potential ${type} exposure:`);
            results.forEach((r) => {
                console.log(`   - ${r.id}: ${r.content}`);
            });
            issuesFound += results.length;
        }
    }

    if (issuesFound === 0) {
        console.log('✅ No sensitive content patterns detected');
    } else {
        console.log(`⚠️  Found ${issuesFound} potential issues that may need manual review`);
    }
}

// Export for use in other scripts
export { obfuscateExistingEmbeddings, verifyObfuscation };

// Run if called directly
if (require.main === module) {
    obfuscateExistingEmbeddings()
        .then(() => {
            console.log('✅ Embeddings obfuscation completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Embeddings obfuscation failed:', error);
            process.exit(1);
        });
}
}

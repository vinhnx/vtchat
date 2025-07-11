import { log } from '@repo/shared/logger';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { embeddings } from '@/lib/database/schema';
import { containsPII, secureContentForEmbedding } from '@/lib/utils/content-security';

export async function POST(_request: Request) {
    try {
        // Verify admin access
        const session = await auth.api.getSession({
            headers: await import('next/headers').then((m) => m.headers()),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin =
            session.user.email?.endsWith('@admin.com') || (session.user as any).role === 'admin';

        if (!isAdmin) {
            return NextResponse.json(
                {
                    error: 'Insufficient permissions - admin role required',
                },
                { status: 403 }
            );
        }

        // Apply obfuscation to existing embeddings
        // Get embeddings that might need obfuscation
        const candidateEmbeddings = await db
            .select({
                id: embeddings.id,
                content: embeddings.content,
            })
            .from(embeddings)
            .where(sql`content NOT LIKE '%_REDACTED%'`)
            .limit(100); // Process in batches

        let updatedCount = 0;
        let skippedCount = 0;
        const updates = [];

        for (const embedding of candidateEmbeddings) {
            const originalContent = embedding.content;
            const securedContent = secureContentForEmbedding(originalContent);

            if (originalContent !== securedContent) {
                await db
                    .update(embeddings)
                    .set({ content: securedContent })
                    .where(sql`id = ${embedding.id}`);

                updates.push({
                    id: embedding.id,
                    originalLength: originalContent.length,
                    securedLength: securedContent.length,
                    hadPII: containsPII(originalContent),
                });

                updatedCount++;
            } else {
                skippedCount++;
            }
        }

        const result = {
            processed: candidateEmbeddings.length,
            updated: updatedCount,
            skipped: skippedCount,
            updates,
        };

        log.info(
            {
                adminId: session.user.id,
                ...result,
            },
            'Admin applied embeddings obfuscation'
        );

        return NextResponse.json({
            message: 'Embeddings obfuscation completed successfully',
            result,
        });
    } catch (error) {
        log.error({ error }, 'Failed to obfuscate embeddings');

        return NextResponse.json(
            {
                error: 'Obfuscation failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// GET endpoint to check obfuscation status
export async function GET(_request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await import('next/headers').then((m) => m.headers()),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin =
            session.user.email?.endsWith('@admin.com') || (session.user as any).role === 'admin';

        if (!isAdmin) {
            return NextResponse.json(
                {
                    error: 'Insufficient permissions - admin role required',
                },
                { status: 403 }
            );
        }

        // Check obfuscation status
        const total = await db.select({ count: sql<number>`count(*)` }).from(embeddings);

        const obfuscated = await db
            .select({ count: sql<number>`count(*)` })
            .from(embeddings)
            .where(sql`content LIKE '%_REDACTED%'`);

        const unprocessed = await db
            .select({ count: sql<number>`count(*)` })
            .from(embeddings)
            .where(sql`content NOT LIKE '%_REDACTED%'`);

        const status = {
            total: total[0].count,
            obfuscated: obfuscated[0].count,
            unprocessed: unprocessed[0].count,
            obfuscationRate:
                total[0].count > 0 ? Math.round((obfuscated[0].count / total[0].count) * 100) : 0,
        };

        return NextResponse.json({
            message: 'Obfuscation status retrieved',
            status,
        });
    } catch (error) {
        log.error({ error }, 'Status check error');
        return NextResponse.json(
            {
                error: 'Status check failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

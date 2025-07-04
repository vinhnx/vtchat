export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { log } from '@repo/shared/logger';
import { eq, inArray } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { embeddings, resources } from '@/lib/database/schema';

export async function DELETE(_req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await import('next/headers').then((m) => m.headers()),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // First get all resource IDs for this user
        const userResources = await db
            .select({ id: resources.id })
            .from(resources)
            .where(eq(resources.userId, userId));

        const resourceIds = userResources.map((r) => r.id);

        // Delete all embeddings for user's resources
        if (resourceIds.length > 0) {
            await db.delete(embeddings).where(inArray(embeddings.resourceId, resourceIds));
        }

        // Delete all resources for the user
        await db.delete(resources).where(eq(resources.userId, userId));

        return NextResponse.json(
            { message: 'Knowledge base cleared successfully' },
            { status: 200 }
        );
    } catch (error) {
        log.error('Error clearing knowledge base:', { error });
        return NextResponse.json({ error: 'Failed to clear knowledge base' }, { status: 500 });
    }
}

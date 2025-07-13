export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { embeddings, resources } from '@/lib/database/schema';
import { log } from '@repo/shared/logger';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { checkVTPlusAccess } from '../../subscription/access-control';

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check VT+ access for RAG feature
        const headersList = await headers();
        const ip = headersList.get('x-real-ip') ?? headersList.get('x-forwarded-for') ?? undefined;
        const vtPlusCheck = await checkVTPlusAccess({ userId: session.user.id, ip });
        if (!vtPlusCheck.hasAccess) {
            return NextResponse.json(
                {
                    error: 'VT+ subscription required',
                    message:
                        'Personal AI Assistant with Memory is a VT+ exclusive feature. Please upgrade to access this functionality.',
                    code: 'VT_PLUS_REQUIRED',
                },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
        }

        const userId = session.user.id;

        // Delete the specific resource and its associated embeddings
        // First delete embeddings that reference this resource
        await db.delete(embeddings).where(eq(embeddings.resourceId, id));

        // Then delete the resource itself (with user ownership check)
        await db.delete(resources).where(and(eq(resources.id, id), eq(resources.userId, userId)));

        return NextResponse.json({
            success: true,
            message: 'Record deleted successfully',
        });
    } catch (error) {
        log.error('Error deleting RAG record:', { error });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

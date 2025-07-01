export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { resources, embeddings } from '@/lib/database/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { log } from '@repo/shared/logger';

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await import('next/headers').then(m => m.headers()),
        });
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
        }

        const userId = session.user.id;

        // Delete the specific resource and its associated embeddings
        // First delete embeddings that reference this resource
        await db.delete(embeddings).where(
            eq(embeddings.resourceId, id)
        );
        
        // Then delete the resource itself (with user ownership check)
        await db.delete(resources).where(
            and(
                eq(resources.id, id),
                eq(resources.userId, userId)
            )
        );
        
        return NextResponse.json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
        log.error('Error deleting RAG record:', { error });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { resources } from '@/lib/database/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@repo/shared/logger';

export async function GET(_req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await import('next/headers').then(m => m.headers()),
        });
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Get all resources for the user
        const userResources = await db
            .select({
                id: resources.id,
                content: resources.content,
                createdAt: resources.createdAt,
            })
            .from(resources)
            .where(eq(resources.userId, userId))
            .orderBy(desc(resources.createdAt));

        return NextResponse.json({
            resources: userResources,
            knowledge: userResources, // Support both field names for compatibility
            total: userResources.length
        });
    } catch (error) {
        logger.error('Error fetching knowledge base:', { data: error });
        return NextResponse.json(
            { error: 'Failed to fetch knowledge base' },
            { status: 500 }
        );
    }
}

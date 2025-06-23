import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { resources } from '@/lib/database/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

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
        console.error('Error fetching knowledge base:', error);
        return NextResponse.json(
            { error: 'Failed to fetch knowledge base' },
            { status: 500 }
        );
    }
}

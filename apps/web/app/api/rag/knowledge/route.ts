export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { log } from '@repo/shared/logger';
import { desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { resources } from '@/lib/database/schema';
import { enforceVTPlusAccess } from '../../subscription/access-control';

export async function GET(request: NextRequest) {
    try {
        // Use enforceVTPlusAccess middleware for consistent access control
        const { success, response, userId } = await enforceVTPlusAccess(request);
        if (!success) {
            return response!;
        }

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
            total: userResources.length,
        });
    } catch (error) {
        log.error({ error }, 'Error fetching knowledge base');
        return NextResponse.json({ error: 'Failed to fetch knowledge base' }, { status: 500 });
    }
}

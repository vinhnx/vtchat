export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { resources } from '@/lib/database/schema';
import { log } from '@repo/shared/logger';
import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { checkVTPlusAccess } from '../../subscription/access-control';

export async function GET(_req: NextRequest) {
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
            total: userResources.length,
        });
    } catch (error) {
        log.error({ error }, 'Error fetching knowledge base');
        return NextResponse.json({ error: 'Failed to fetch knowledge base' }, { status: 500 });
    }
}

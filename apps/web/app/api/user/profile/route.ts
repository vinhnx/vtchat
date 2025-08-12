import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { log } from '@repo/shared/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Fetch user data from database
        const userResults = await db
            .select({
                id: users.id,
                email: users.email,
                planSlug: users.planSlug,
                name: users.name,
                image: users.image,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (userResults.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = userResults[0];

        // Create subscription metadata based on user's plan_slug
        const subscriptionMetadata = user.planSlug && user.planSlug !== PlanSlug.VT_BASE
            ? {
                subscription: {
                    planSlug: user.planSlug,
                    isActive: true,
                    // Don't set expiresAt for plan_slug based subscriptions as they might be admin-granted
                },
            }
            : {};

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                planSlug: user.planSlug || PlanSlug.VT_BASE,
                // Include subscription metadata for the useSubscription hook
                publicMetadata: {
                    planSlug: user.planSlug || PlanSlug.VT_BASE,
                    ...subscriptionMetadata,
                },
            },
            success: true,
        });
    } catch (error) {
        log.error('Profile error:', { error });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

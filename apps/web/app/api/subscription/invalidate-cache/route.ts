import { auth } from '@/lib/auth-server';
import { invalidateSubscriptionCache } from '@/lib/subscription/subscription-access-simple';
import { log } from '@repo/shared/logger';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Parse JSON body, but handle empty body gracefully
        let targetUserId;
        try {
            const body = await request.json();
            targetUserId = body.targetUserId || body.userId; // Support both field names
        } catch {
            // Empty body or invalid JSON - use current user ID
            targetUserId = undefined;
        }

        const userIdToInvalidate = targetUserId || userId;

        // Check if user is admin for cross-user cache invalidation
        if (targetUserId && targetUserId !== userId) {
            // Check if current user is admin
            if (session.user.role !== 'admin') {
                return NextResponse.json(
                    { error: "Forbidden: Only admins can invalidate other users' caches" },
                    { status: 403 },
                );
            }
        }

        invalidateSubscriptionCache(userIdToInvalidate);

        log.info(
            { invalidatedUserId: userIdToInvalidate, requestingUserId: userId },
            'Cache invalidated for user',
        );

        return NextResponse.json({
            success: true,
            message: `Cache invalidated for user ${userIdToInvalidate}`,
            invalidatedUserId: userIdToInvalidate,
        });
    } catch (error) {
        log.error({ error }, '[Subscription Cache API] Error');
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 },
        );
    }
}

import { auth } from '@/lib/auth-server';
import { invalidateSubscriptionCache } from '@/lib/subscription-cache';
import { NextRequest, NextResponse } from 'next/server';

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
            targetUserId = body.targetUserId;
        } catch {
            // Empty body or invalid JSON - use current user ID
            targetUserId = undefined;
        }

        // For now, users can only invalidate their own cache
        // In production, you might want admin users to invalidate any cache
        const userIdToInvalidate = targetUserId || userId;

        // TODO: Add admin check for invalidating other users' caches
        if (targetUserId && targetUserId !== userId) {
            return NextResponse.json(
                { error: 'Forbidden: Cannot invalidate other users cache' },
                { status: 403 }
            );
        }

        invalidateSubscriptionCache(userIdToInvalidate);

        console.log(
            `[Subscription Cache API] Cache invalidated for user ${userIdToInvalidate} by ${userId}`
        );

        return NextResponse.json({
            success: true,
            message: `Cache invalidated for user ${userIdToInvalidate}`,
            invalidatedUserId: userIdToInvalidate,
        });
    } catch (error) {
        console.error('[Subscription Cache API] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

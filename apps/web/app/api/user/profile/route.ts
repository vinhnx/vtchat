import { auth } from '@/lib/auth';
import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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
                credits: users.credits,
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

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                credits: user.credits || 0,
                planSlug: user.planSlug || 'free',
            },
            success: true,
        });
    } catch (error) {
        console.error('Profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

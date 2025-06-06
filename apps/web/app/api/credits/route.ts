import { auth } from '@/lib/auth';
import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Get authenticated session
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's credit balance from database
        const user = await db
            .select({ credits: users.credits })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (user.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const credits = user[0].credits || 0;

        return NextResponse.json({
            credits,
            userId: session.user.id,
        });
    } catch (error) {
        console.error('Error fetching credits:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

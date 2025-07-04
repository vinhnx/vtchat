import { geolocation } from '@vercel/functions';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { feedback } from '@/lib/database/schema';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedback: feedbackText } = await request.json();

    await db.insert(feedback).values({
        userId,
        feedback: feedbackText,
        metadata: {
            geo: geolocation(request),
        },
    });

    return NextResponse.json({ message: 'Feedback received' }, { status: 200 });
}

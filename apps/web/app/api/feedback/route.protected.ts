import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { feedback } from '@/lib/database/schema';
import { arcjetFeedback, handleArcjetDecision } from '@/lib/arcjet';
import { geolocation } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';
import { log } from '@repo/shared/logger';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    // Apply Arcjet protection for feedback endpoints
    if (arcjetFeedback) {
        try {
            const { feedback: feedbackText } = await request.json();
            
            const decision = await arcjetFeedback.protect(request, {
                // Email validation if provided
                email: feedbackText?.email || undefined,
            });
            
            const denial = handleArcjetDecision(decision);
            if (denial) {
                return NextResponse.json(denial.body, { 
                    status: denial.status,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(denial.body.retryAfter && {
                            'Retry-After': denial.body.retryAfter
                        })
                    }
                });
            }
        } catch (error) {
            log.error('[Feedback] Arcjet protection failed:', { error });
            // Continue without Arcjet protection if it fails
        }
    }

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

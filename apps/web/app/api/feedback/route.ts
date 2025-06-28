import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { feedback } from '@/lib/database/schema';
import arcjet, { detectBot, shield, slidingWindow, validateEmail } from '@arcjet/next';
import { geolocation } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Arcjet protection for feedback endpoints
const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    characteristics: ["ip.src"],
    rules: [
        shield({ mode: "LIVE" }),
        detectBot({
            mode: "LIVE",
            allow: [],
        }),
        slidingWindow({
            mode: "LIVE",
            interval: "10m",
            max: 5,
        }),
        validateEmail({
            mode: "LIVE",
            block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
        }),
    ],
});

export async function POST(request: NextRequest) {
    // Apply Arcjet protection if key is available
    if (process.env.ARCJET_KEY) {
        const decision = await aj.protect(request);
        
        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return NextResponse.json({ 
                    error: "Rate limit exceeded", 
                    message: "Please try again in a few minutes." 
                }, { status: 429 });
            } else if (decision.reason.isBot()) {
                return NextResponse.json({ 
                    error: "Bot traffic not allowed" 
                }, { status: 403 });
            } else if (decision.reason.isEmail()) {
                return NextResponse.json({ 
                    error: "Invalid email address" 
                }, { status: 400 });
            } else {
                return NextResponse.json({ 
                    error: "Request denied" 
                }, { status: 403 });
            }
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

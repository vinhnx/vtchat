import { auth } from '@/lib/auth-server';
import ip from '@arcjet/ip';
import arcjet, {
    type ArcjetDecision,
    detectBot,
    protectSignup,
    shield,
    slidingWindow,
} from '@arcjet/next';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';
import { log } from '@repo/shared/logger';

// Create Arcjet instance for Better Auth protection
const aj = arcjet({
    key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
    characteristics: ["userId"],
    rules: [
        // Shield protects your app from common attacks e.g. SQL injection
        shield({ mode: "LIVE" }),
    ],
});

const emailOptions = {
    mode: "LIVE" as const,
    block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
};

const botOptions = {
    mode: "LIVE" as const,
    allow: [], // prevents bots from submitting the form
};

const rateLimitOptions = {
    mode: "LIVE" as const,
    interval: "2m" as const,
    max: 5,
};

const signupOptions = {
    email: emailOptions,
    bots: botOptions,
    rateLimit: rateLimitOptions,
};

// CORS headers for auth endpoints
const corsHeaders = {
    'Access-Control-Allow-Origin':
        process.env.NEXT_PUBLIC_BASE_URL || 'https://vtchat.io.vn',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
};

// Arcjet protection for Better Auth
async function protect(req: NextRequest): Promise<ArcjetDecision> {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    // Use user ID if logged in, otherwise fall back to IP address
    let userId: string;
    if (session?.user.id) {
        userId = session.user.id;
    } else {
        userId = ip(req) || '127.0.0.1';
    }

    // Special protection for signup routes
    if (req.nextUrl.pathname.includes('/sign-up')) {
        try {
            // Better-Auth reads the body, so we need to clone the request preemptively
            const body = await req.clone().json();

            // If the email is in the body of the request then we can run
            // the email validation checks as well
            if (typeof body.email === 'string') {
                return aj
                    .withRule(protectSignup(signupOptions))
                    .protect(req, { email: body.email, userId });
            } else {
                // Otherwise use rate limit and detect bot
                return aj
                    .withRule(detectBot(botOptions))
                    .withRule(slidingWindow(rateLimitOptions))
                    .protect(req, { userId });
            }
        } catch (_error) {
            // If we can't parse the body, apply basic protection
            return aj
                .withRule(detectBot(botOptions))
                .withRule(slidingWindow(rateLimitOptions))
                .protect(req, { userId });
        }
    } else {
        // For all other auth requests
        return aj.withRule(detectBot(botOptions)).protect(req, { userId });
    }
}

// Handle preflight requests
export async function OPTIONS(_request: Request) {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}

// Use Better Auth's recommended Next.js handler
const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth);

// Wrap the handlers to add CORS headers and error handling
export async function GET(request: Request) {
    try {
        const response = await originalGET(request);

        // Add CORS headers to the response
        Object.entries(corsHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        log.error('[Auth API] GET error:', { error });
        return new NextResponse(JSON.stringify({ error: 'Authentication service unavailable' }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
        });
    }
}

export async function POST(request: NextRequest) {
    // Apply Arcjet protection if key is available
    if (process.env.ARCJET_KEY) {
        const decision = await protect(request);
        log.info('Arcjet Decision:', { data: decision });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return new NextResponse(null, { 
                    status: 429,
                    headers: corsHeaders 
                });
            } else if (decision.reason.isEmail()) {
                let message: string;

                if (decision.reason.emailTypes.includes('INVALID')) {
                    message = 'Email address format is invalid. Is there a typo?';
                } else if (decision.reason.emailTypes.includes('DISPOSABLE')) {
                    message = 'We do not allow disposable email addresses.';
                } else if (decision.reason.emailTypes.includes('NO_MX_RECORDS')) {
                    message = 'Your email domain does not have an MX record. Is there a typo?';
                } else {
                    message = 'Invalid email.';
                }

                return NextResponse.json({ message }, { 
                    status: 400,
                    headers: corsHeaders 
                });
            } else {
                return new NextResponse(null, { 
                    status: 403,
                    headers: corsHeaders 
                });
            }
        }
    }

    try {
        const response = await originalPOST(request);

        // Add CORS headers to the response
        Object.entries(corsHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        log.error('[Auth API] POST error:', { error });
        return new NextResponse(JSON.stringify({ error: 'Authentication service unavailable' }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
        });
    }
}

import { auth, authConfigured } from '@/lib/auth-server';
import { log } from '@repo/shared/logger';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextResponse, type NextRequest } from 'next/server';

// CORS headers for auth endpoints
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_BASE_URL || 'https://vtchat.io.vn',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
};

// Handle preflight requests
export async function OPTIONS(_request: Request) {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}

// Use Better Auth's recommended Next.js handler
const handlers = authConfigured ? toNextJsHandler(auth as any) : null;
const originalGET = handlers?.GET;
const originalPOST = handlers?.POST;

// Wrap the handlers to add CORS headers and error handling
export async function GET(request: Request) {
    const url = request.url || '';

    if (!authConfigured || !originalGET) {
        // Local/dev fallback to keep UX working without DATABASE_URL
        if (url.includes('/fetch-options')) {
            return new NextResponse(
                JSON.stringify({ methods: ['GET', 'POST'] }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                },
            );
        }

        if (url.includes('/get-session')) {
            return new NextResponse(
                JSON.stringify({ session: null, user: null }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                },
            );
        }

        return new NextResponse(
            JSON.stringify({
                error: 'Authentication not configured locally (missing DATABASE_URL)',
            }),
            {
                status: 503,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            },
        );
    }

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
    const url = request.url || '';

    if (!authConfigured || !originalPOST) {
        // In local/dev without DATABASE_URL, allow sign-out to succeed so logout UX works
        if (url.includes('/sign-out')) {
            return new NextResponse(
                JSON.stringify({ success: true }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                },
            );
        }

        if (url.includes('/fetch-options')) {
            return new NextResponse(
                JSON.stringify({ methods: ['GET', 'POST'] }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders,
                    },
                },
            );
        }

        return new NextResponse(
            JSON.stringify({
                error: 'Authentication not configured locally (missing DATABASE_URL)',
            }),
            {
                status: 503,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            },
        );
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

import { auth } from '@/lib/auth-server';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';
import { log } from '@repo/shared/logger';

// CORS headers for auth endpoints
const corsHeaders = {
    'Access-Control-Allow-Origin':
        process.env.NEXT_PUBLIC_BASE_URL || 'https://vtchat.io.vn',
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

import { auth } from '@/lib/auth-server';
import { log } from '@repo/shared/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_BASE_URL || 'https://vtchat.io.vn',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
};

export function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        return NextResponse.json(
            {
                session,
                authenticated: Boolean(session?.user),
            },
            {
                status: 200,
                headers: corsHeaders,
            },
        );
    } catch (error) {
        log.error({ error }, 'Failed to fetch session');
        return NextResponse.json(
            {
                error: 'Unable to fetch session',
            },
            {
                status: 500,
                headers: corsHeaders,
            },
        );
    }
}

// Minimal imports to fix build issue
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

type RequestBody = {
    prompt?: string;
    apiKeys?: Record<string, string>;
    images?: Array<{
        base64?: string;
        mediaType?: string;
        url?: string;
        name?: string;
    }>;
};

export async function POST(request: NextRequest) {
    // Minimal implementation to fix build issue
    return new Response(JSON.stringify({
        error: 'Image generation temporarily unavailable - under maintenance'
    }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
    });
}

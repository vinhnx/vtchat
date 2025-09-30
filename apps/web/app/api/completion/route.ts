// Minimal imports to fix build issue
import type { NextRequest } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Temporarily comment out all complex imports
// import { hasImageAttachments, validateByokForImageAnalysis } from '@repo/shared/utils';
// import { HEARTBEAT_COMMENT, HEARTBEAT_INTERVAL_MS, HEARTBEAT_JITTER_MS } from './constants';
// import { executeStream, markControllerClosed } from './stream-handlers';
// import { registerStream, unregisterStream } from './stream-registry';
// import { completionRequestSchema, SSE_HEADERS } from './types';
// import { getIp } from './utils';

export async function POST(request: NextRequest) {
    // Minimal implementation to fix build issue
    return new Response(JSON.stringify({
        error: 'Service temporarily unavailable - under maintenance'
    }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
    });
}


import { checkVTPlusAccess } from '@/app/api/subscription/access-control';
import { auth } from '@/lib/auth-server';
import { userRateLimits } from '@/lib/database/schema';
import { getRateLimitStatus, recordRequest } from '@/lib/services/rate-limit';
import type { ModelEnum } from '@repo/ai/models';
import { db } from '@repo/shared/lib/database';
import { log } from '@repo/shared/logger';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const userId = session.user.id;
        const searchParams = request.nextUrl.searchParams;
        const modelId = searchParams.get('model') as ModelEnum;

        // Check VT+ status for proper limit calculation
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
            || 'unknown';
        const vtPlusAccess = await checkVTPlusAccess({ userId, ip });
        const isVTPlusUser = vtPlusAccess.hasAccess;

        // If no model specified, return all Gemini models
        if (!modelId) {
            const { GEMINI_MODEL_ENUMS_ARRAY } = await import('@repo/shared/utils');
            const geminiModels = GEMINI_MODEL_ENUMS_ARRAY;

            const allStatuses: Record<string, unknown> = {};

            for (const model of geminiModels) {
                try {
                    const status = await getRateLimitStatus(userId, model, isVTPlusUser);
                    allStatuses[model] = status;
                } catch (error) {
                    log.error({ error, model }, 'Error getting rate limit status for model');
                    // Continue with other models even if one fails
                    allStatuses[model] = null;
                }
            }

            return new Response(JSON.stringify(allStatuses), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, max-age=0',
                },
            });
        }

        // Single model request
        const status = await getRateLimitStatus(userId, modelId, isVTPlusUser);

        return new Response(JSON.stringify(status), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, max-age=0',
            },
        });
    } catch (error) {
        log.error({ error }, 'Error getting rate limit status');
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const userId = session.user.id;

        // Model can be from query string or JSON body
        const searchParams = request.nextUrl.searchParams;
        let modelId = searchParams.get('model') as ModelEnum;

        if (!modelId) {
            try {
                const body = await request.json();
                modelId = body.model as ModelEnum;
            } catch {
                // Ignore JSON parsing error, modelId remains undefined
            }
        }

        if (!modelId) {
            return new Response(JSON.stringify({ error: 'Missing model parameter' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check VT+ access
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
            || 'unknown';
        const vtPlusAccess = await checkVTPlusAccess({ userId, ip });

        // Record the successful request
        await recordRequest(userId, modelId, vtPlusAccess.hasAccess);

        // Return fresh status so UI can update instantly
        const status = await getRateLimitStatus(userId, modelId, vtPlusAccess.hasAccess);

        return new Response(JSON.stringify(status), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, max-age=0',
            },
        });
    } catch (error) {
        log.error({ error }, 'Error recording rate limit usage');
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Preview zero-value records endpoint (GET /api/rate-limit/status/zero-records)
export const dynamic = 'force-dynamic';
export async function GET_ZERO_RECORDS(request: NextRequest) {
    try {
        // Only allow admin or internal use (add your own access control as needed)
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id /* || !isAdmin(session.user.id) */) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        // Query all user_rate_limits records with both counts zero
        const zeroRecords = await db
            .select()
            .from(userRateLimits)
            .where(
                and(
                    eq(userRateLimits.dailyRequestCount, '0'),
                    eq(userRateLimits.minuteRequestCount, '0'),
                ),
            )
            .limit(1000); // Limit for safety
        return new Response(JSON.stringify({ zeroRecords }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        log.error({ error }, 'Error previewing zero-value rate limit records');
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

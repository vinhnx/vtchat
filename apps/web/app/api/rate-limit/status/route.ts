import type { ModelEnum } from '@repo/ai/models';
import { log } from '@repo/shared/logger';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

const ensureDb = async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return null;
    const { db } = await import('@repo/shared/lib/database');
    const { userRateLimits } = await import('@/lib/database/schema');
    return { db, userRateLimits };
};

export async function GET(request: NextRequest) {
    try {
        if (!process.env.DATABASE_URL) {
            log.error('DATABASE_URL is not configured for rate-limit status');
            return new Response(JSON.stringify({ error: 'Service unavailable' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { auth } = await import('@/lib/auth-server');
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
        const { checkVTPlusAccess } = await import('@/app/api/subscription/access-control');
        const vtPlusAccess = await checkVTPlusAccess({ userId, ip });
        const isVTPlusUser = vtPlusAccess.hasAccess;

        // If no model specified, return all Gemini models
        if (!modelId) {
            const { getRateLimitStatus } = await import('@/lib/services/rate-limit');
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
        const { getRateLimitStatus } = await import('@/lib/services/rate-limit');
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
        if (!process.env.DATABASE_URL) {
            log.error('DATABASE_URL is not configured for rate-limit updates');
            return new Response(JSON.stringify({ error: 'Service unavailable' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { auth } = await import('@/lib/auth-server');
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
        const { checkVTPlusAccess } = await import('@/app/api/subscription/access-control');
        const vtPlusAccess = await checkVTPlusAccess({ userId, ip });

        // Record the successful request
        const { recordRequest, getRateLimitStatus } = await import('@/lib/services/rate-limit');
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
        const dbResources = await ensureDb();
        if (!dbResources) {
            log.error('DATABASE_URL is not configured for rate-limit zero-records');
            return new Response(JSON.stringify({ error: 'Service unavailable' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Only allow admin or internal use (add your own access control as needed)
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user?.id /* || !isAdmin(session.user.id) */) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        // Query all user_rate_limits records with both counts zero
        const zeroRecords = await dbResources.db
            .select()
            .from(dbResources.userRateLimits)
            .where(
                and(
                    eq(dbResources.userRateLimits.dailyRequestCount, '0'),
                    eq(dbResources.userRateLimits.minuteRequestCount, '0'),
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

import type { ModelEnum } from '@repo/ai/models';
import { log } from '@repo/shared/logger';
import type { NextRequest } from 'next/server';
import { checkVTPlusAccess } from '@/app/api/subscription/access-control';
import { auth } from '@/lib/auth-server';
import { getRateLimitStatus } from '@/lib/services/rate-limit';

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
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const vtPlusAccess = await checkVTPlusAccess({ userId, ip });
        const isVTPlusUser = vtPlusAccess.hasAccess;

        // If no model specified, return all Gemini models
        if (!modelId) {
            const { ModelEnum } = await import('@repo/ai/models');
            const geminiModels = [
                ModelEnum.GEMINI_2_5_FLASH_LITE,
                ModelEnum.GEMINI_2_5_FLASH, 
                ModelEnum.GEMINI_2_5_PRO,
                ModelEnum.GEMINI_2_0_FLASH,
                ModelEnum.GEMINI_2_0_FLASH_LITE
            ];

            const allStatuses: Record<string, any> = {};
            
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

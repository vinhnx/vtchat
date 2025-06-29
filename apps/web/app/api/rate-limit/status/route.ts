import { auth } from '@/lib/auth-server';
import { getRateLimitStatus } from '@/lib/services/rate-limit';
import { ModelEnum } from '@repo/ai/models';
import { NextRequest } from 'next/server';
import { logger } from '@repo/shared/logger';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        
        if (!session?.user?.id) {
            return new Response(
                JSON.stringify({ error: 'Authentication required' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const userId = session.user.id;
        const searchParams = request.nextUrl.searchParams;
        const modelId = searchParams.get('model') as ModelEnum;

        if (!modelId) {
            return new Response(
                JSON.stringify({ error: 'Model parameter is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const status = await getRateLimitStatus(userId, modelId);
        
        return new Response(
            JSON.stringify(status),
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, max-age=0'
                } 
            }
        );
    } catch (error) {
        logger.error('Error getting rate limit status:', { data: error });
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

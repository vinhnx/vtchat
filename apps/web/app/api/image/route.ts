import { auth } from '@/lib/auth-server';
import { generateGeminiImage } from '@repo/ai/image';
import { apiKeyMapper } from '@repo/ai/services/api-key-mapper';
import {
    createSecureHeaders,
    extractApiKeysFromHeaders,
    validateHTTPS,
} from '@repo/shared/constants/security-headers';
import { log } from '@repo/shared/logger';
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
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        const userId = session?.user?.id ?? undefined;
        const userTier = session?.session?.user?.planSlug ?? undefined;

        if (process.env.NODE_ENV === 'production' && !validateHTTPS(request)) {
            return new Response(
                JSON.stringify({ error: 'HTTPS required' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', ...createSecureHeaders() },
                },
            );
        }

        const parsed = (await request.json().catch(() => ({}))) as RequestBody;
        const prompt = (parsed?.prompt || '').toString().trim();
        if (!prompt) {
            return new Response(
                JSON.stringify({ error: 'Invalid request', message: 'Prompt is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } },
            );
        }

        // Prefer secure headers for BYOK; fallback to body
        let apiKeysFromHeaders: Record<string, string> = {};
        try {
            apiKeysFromHeaders = extractApiKeysFromHeaders(request.headers);
        } catch {
            // ignore
        }
        const combinedApiKeys = { ...parsed?.apiKeys, ...apiKeysFromHeaders };

        let byokKeys: Record<string, string> | undefined = undefined;
        if (combinedApiKeys && Object.keys(combinedApiKeys).length > 0) {
            try {
                byokKeys = apiKeyMapper.mapFrontendToProvider(combinedApiKeys);
            } catch (error) {
                log.error({ error }, 'Failed to transform API keys for image generation');
                return new Response(
                    JSON.stringify({ error: 'API Key Configuration Error' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } },
                );
            }
        }

        const result = await generateGeminiImage({
            prompt,
            byokKeys,
            userId,
            userTier,
            images: parsed.images,
        });

        return new Response(
            JSON.stringify({ text: result.text, images: result.images }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
    } catch (error: any) {
        const message = error?.message || 'Unknown error';
        log.error({ error: message }, 'Gemini image generation failed');
        const lower = String(message).toLowerCase();
        const needsApiKey = lower.includes('api key') || lower.includes('gemini');
        const status = needsApiKey ? 400 : 500;
        return new Response(
            JSON.stringify({
                error: needsApiKey ? 'API key required' : 'Image generation failed',
                message,
                settingsAction: needsApiKey ? 'open_api_keys' : undefined,
                provider: needsApiKey ? 'google' : undefined,
            }),
            { status, headers: { 'Content-Type': 'application/json' } },
        );
    }
}

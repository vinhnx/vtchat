import { log } from '@repo/shared/lib/logger';
import { ModelEnum } from '../models';

type GoogleGenerateContentResponse = {
    candidates?: Array<{
        content?: { parts?: Array<{ text?: string; }>; };
        groundingMetadata?: any;
        url_context_metadata?: {
            url_metadata?: Array<{
                retrieved_url?: string;
                url_retrieval_status?: string;
            }>;
        };
    }>;
    usageMetadata?: any;
};

function getEffectiveGeminiApiKey(byokKeys?: Record<string, string>): {
    apiKey: string | null;
    via: 'byok' | 'env' | 'window' | 'none';
} {
    // Prefer BYOK first
    const byok = byokKeys?.GEMINI_API_KEY?.trim();
    if (byok) return { apiKey: byok, via: 'byok' };

    // Try server env
    if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
        return { apiKey: process.env.GEMINI_API_KEY, via: 'env' };
    }

    // Try browser/window keys (worker/client-side path)
    try {
        if (typeof window !== 'undefined' && (window as any).AI_API_KEYS?.google) {
            return { apiKey: (window as any).AI_API_KEYS.google, via: 'window' };
        }
    } catch {
        // window not available in this environment
    }

    return { apiKey: null, via: 'none' };
}

function extractTextParts(resp: GoogleGenerateContentResponse): string {
    const parts = resp?.candidates?.[0]?.content?.parts || [];
    return parts.map((p) => p.text || '').join('');
}

function extractUrlContextSources(resp: GoogleGenerateContentResponse) {
    const urlMeta = resp?.candidates?.[0]?.url_context_metadata?.url_metadata || [];
    return urlMeta
        .filter((m) => typeof m?.retrieved_url === 'string' && m.retrieved_url.trim() !== '')
        .map((m, i) => ({
            title: 'URL Context',
            url: m.retrieved_url!,
            description: m.url_retrieval_status || '',
            index: i + 1,
        }));
}

export async function generateWithUrlContext({
    prompt,
    model,
    byokKeys,
    signal,
}: {
    prompt: string;
    model: ModelEnum;
    byokKeys?: Record<string, string>;
    signal?: AbortSignal;
}): Promise<{
    text: string;
    sources: Array<{ title: string; url: string; description?: string; index: number; }>;
    groundingMetadata: any;
    urlContextMetadata: any;
}> {
    const { apiKey, via } = getEffectiveGeminiApiKey(byokKeys);

    if (model === ModelEnum.GEMINI_2_5_FLASH_LITE && via === 'env') {
        const err = 'Gemini 2.5 Flash Lite now requires your own Gemini API key.';
        log.error({ via }, err);
        throw new Error(`${err} Add your key in settings to continue.`);
    }

    if (!apiKey) {
        const err = 'Gemini API key is required for URL context.';
        log.error({ via }, err);
        throw new Error(err);
    }

    const modelId = model.toString();

    const body = {
        contents: [
            {
                parts: [{ text: prompt }],
            },
        ],
        // Enable both URL context and Google Search grounding
        tools: [{ url_context: {} }, { google_search: {} }],
    } as const;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${
        encodeURIComponent(
            modelId,
        )
    }:generateContent`;

    log.info('Calling Google generateContent with URL Context', {
        model: modelId,
        promptPreview: prompt.slice(0, 120),
        via,
    });

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        log.error({ status: res.status, body: text }, 'URL context call failed');
        throw new Error(`URL context request failed (${res.status})`);
    }

    const json = (await res.json()) as GoogleGenerateContentResponse;
    const text = extractTextParts(json);
    const sources = extractUrlContextSources(json);
    const groundingMetadata = json?.candidates?.[0]?.groundingMetadata ?? null;
    const urlContextMetadata = json?.candidates?.[0]?.url_context_metadata ?? null;

    return { text, sources, groundingMetadata, urlContextMetadata };
}

export function extractUrlsFromText(input: string): string[] {
    if (!input) return [];
    // Basic URL detection, up to 20 URLs per Google tool limits
    const regex = /https?:\/\/[\w.-]+(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?/gi;
    const matches = input.match(regex) || [];
    // Deduplicate and cap at 20
    const unique = Array.from(new Set(matches));
    return unique.slice(0, 20);
}

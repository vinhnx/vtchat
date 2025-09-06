import { log } from '@repo/shared/logger';
import { generateText as generateTextAi } from 'ai';
import { ModelEnum } from './models';
import { getLanguageModel } from './providers';

type ByokKeys = Record<string, string> | undefined;

export type GeneratedImage = {
    mediaType: string;
    name?: string;
    dataUrl?: string;
    url?: string;
};

export type GenerateGeminiImageParams = {
    prompt: string;
    byokKeys?: ByokKeys;
    userId?: string;
    userTier?: string;
    images?: Array<{
        base64?: string;
        mediaType?: string;
        url?: string;
        name?: string;
    }>;
};

export type GenerateGeminiImageResult = {
    text: string;
    images: GeneratedImage[];
};

export async function generateGeminiImage(
    params: GenerateGeminiImageParams,
): Promise<GenerateGeminiImageResult> {
    const { prompt, byokKeys, userId, userTier, images } = params;

    log.info({ userId, userTier }, 'Generating image with Gemini image-preview');

    // Use the dedicated image-preview model
    const model = getLanguageModel(
        ModelEnum.GEMINI_2_5_FLASH_IMAGE_PREVIEW,
        undefined,
        byokKeys,
        false,
        undefined,
        false,
        userTier === 'PLUS',
    );

    // Extract aspect ratio hints from user prompt or size references
    const extractAspectRatio = (text: string): string | null => {
        const arMatch = text.match(/\b(\d{1,2})\s*[:xX]\s*(\d{1,2})\b/);
        if (arMatch) {
            const a = parseInt(arMatch[1]!, 10);
            const b = parseInt(arMatch[2]!, 10);
            if (a > 0 && b > 0) return `${a}:${b}`;
        }
        // Keywords
        const lower = text.toLowerCase();
        if (/(square|1\s*:\s*1)/.test(lower)) return '1:1';
        if (/(portrait|3\s*:\s*4|4\s*:\s*5|2\s*:\s*3)/.test(lower)) return '3:4';
        if (/(landscape|16\s*:\s*9|4\s*:\s*3|21\s*:\s*9)/.test(lower)) return '16:9';
        return null;
    };

    const arHint = extractAspectRatio(prompt);

    // Strengthen instruction to push image output
    const effectivePrompt = `You are Nano Banana (Gemini 2.5 Flash Image). Follow best practices:
1) Prefer photoreal detail when asked; respect style requests.
2) Compose clean, coherent subjects; avoid duplicated limbs/text.
3) Use consistent lighting; balance foreground/background.
 4) If edits were provided with images, keep all non-edited content unchanged.
 5) If no specific aspect ratio is requested, default to a 16:9 composition.
 Output an IMAGE (and optionally a short TEXT caption). Request:\n\n${prompt}`;

    // Build message with optional inline image parts for editing
    const parts: any[] = [
        { type: 'text', text: effectivePrompt },
    ];

    // Helper to convert base64 to Uint8Array
    const b64ToUint8 = (b64: string): Uint8Array => {
        if (typeof Buffer !== 'undefined') return Buffer.from(b64, 'base64');
        const binary = atob(b64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    };

    if (Array.isArray(images) && images.length > 0) {
        for (const img of images) {
            try {
                if (img.base64) {
                    let mime = img.mediaType || 'image/png';
                    let pure = img.base64;
                    // Handle data URL format
                    if (pure.startsWith('data:')) {
                        const match = pure.match(/^data:(.+);base64,(.*)$/);
                        if (match) {
                            mime = match[1] || mime;
                            pure = match[2] || '';
                        }
                    }
                    parts.push({
                        type: 'file',
                        data: b64ToUint8(pure),
                        mimeType: mime,
                    });
                } else if (img.url) {
                    const res = await fetch(img.url);
                    const ab = await res.arrayBuffer();
                    parts.push({
                        type: 'file',
                        data: new Uint8Array(ab),
                        mimeType: img.mediaType || res.headers.get('content-type') || 'image/png',
                    });
                }
            } catch {}
        }
    }

    const result = await generateTextAi({
        model,
        providerOptions: {
            google: { responseModalities: ['IMAGE', 'TEXT'] },
        },
        ...(parts.length > 1
            ? { messages: [{ role: 'user', content: parts }] }
            : { prompt: effectivePrompt }),
    } as any);

    const text = (result?.text as string) || '';

    const outImages: GeneratedImage[] = [];

    // 1) AI SDK files output
    if (Array.isArray((result as any)?.files)) {
        for (const f of (result as any).files as any[]) {
            const mediaType: string | undefined = f?.mediaType || f?.mimeType;
            if (!mediaType || !String(mediaType).startsWith('image/')) continue;

            const name: string | undefined = f?.name;
            let url: string | undefined;
            let dataUrl: string | undefined;

            if (typeof f.url === 'string') {
                url = f.url;
            }

            // AI SDK may expose base64 or uint8Array
            if (!url && typeof f.base64 === 'string') {
                dataUrl = `data:${mediaType};base64,${f.base64}`;
            } else if (!url && f.uint8Array && typeof Buffer !== 'undefined') {
                try {
                    const base64 = Buffer.from(f.uint8Array).toString('base64');
                    dataUrl = `data:${mediaType};base64,${base64}`;
                } catch {}
            } else if (!url && f.data && typeof Buffer !== 'undefined') {
                try {
                    const base64 = Buffer.from(f.data).toString('base64');
                    dataUrl = `data:${mediaType};base64,${base64}`;
                } catch {}
            }

            outImages.push({
                mediaType,
                name,
                url,
                dataUrl,
                ...(arHint ? { aspectRatio: arHint } : {}),
            });
        }
    }

    // 2) Fallback: inspect Google inlineData in provider response
    if (outImages.length === 0) {
        const resp = (result as any)?.response;
        const candidates = resp?.candidates || resp?.response?.candidates;
        try {
            if (Array.isArray(candidates)) {
                for (const cand of candidates) {
                    const parts = cand?.content?.parts || cand?.candidates?.[0]?.content?.parts;
                    if (!Array.isArray(parts)) continue;
                    for (const part of parts) {
                        const inline = part?.inlineData || part?.inline_data;
                        if (inline?.data && inline?.mimeType) {
                            outImages.push({
                                mediaType: inline.mimeType,
                                dataUrl: `data:${inline.mimeType};base64,${inline.data}`,
                                ...(arHint ? { aspectRatio: arHint } : {}),
                            });
                        }
                        const fileData = part?.fileData || part?.file_data;
                        if (fileData?.fileUri && fileData?.mimeType) {
                            outImages.push({
                                mediaType: fileData.mimeType,
                                url: fileData.fileUri,
                                ...(arHint ? { aspectRatio: arHint } : {}),
                            });
                        }
                    }
                }
            }
        } catch (e) {
            log.warn(
                { error: (e as Error).message },
                'Failed to parse inlineData for image output',
            );
        }
    }

    log.info({ count: outImages.length, hasText: !!text }, 'Gemini image generation completed');
    return { text, images: outImages };
}

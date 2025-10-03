import { log } from '@repo/shared/logger';
import { generateText as generateTextAi } from 'ai';
import { ModelEnum } from './models';
import { getLanguageModel } from './providers';

export const GEMINI_FLASH_IMAGE_ASPECT_RATIOS = [
    '21:9',
    '16:9',
    '4:3',
    '3:2',
    '1:1',
    '9:16',
    '3:4',
    '2:3',
    '5:4',
    '4:5',
] as const;

export type GeminiFlashImageAspectRatio =
    (typeof GEMINI_FLASH_IMAGE_ASPECT_RATIOS)[number];

const GEMINI_FLASH_IMAGE_ASPECT_RATIO_SET = new Set<GeminiFlashImageAspectRatio>(
    GEMINI_FLASH_IMAGE_ASPECT_RATIOS,
);

const GEMINI_FLASH_IMAGE_ASPECT_RATIO_LIST =
    GEMINI_FLASH_IMAGE_ASPECT_RATIOS.join(', ');

export type GeminiImageConfig = {
    aspectRatio?: GeminiFlashImageAspectRatio;
};

type ByokKeys = Record<string, string> | undefined;

export type GeneratedImage = {
    mediaType: string;
    name?: string;
    dataUrl?: string;
    url?: string;
    aspectRatio?: GeminiFlashImageAspectRatio;
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
    config?: GeminiImageConfig;
};

export type GenerateGeminiImageResult = {
    text: string;
    images: GeneratedImage[];
};

export async function generateGeminiImage(
    params: GenerateGeminiImageParams,
): Promise<GenerateGeminiImageResult> {
    const { prompt, byokKeys, userId, userTier, images, config } = params;

    // Use the dedicated image model
    const model = getLanguageModel(
        ModelEnum.GEMINI_2_5_FLASH_IMAGE,
        undefined,
        byokKeys,
        false,
        undefined,
        false,
        userTier === 'PLUS',
    );

    const normalizeAspectRatio = (
        width: number,
        height: number,
    ): GeminiFlashImageAspectRatio | null => {
        if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
        if (width <= 0 || height <= 0) return null;

        let a = Math.round(Math.abs(width));
        let b = Math.round(Math.abs(height));

        const gcd = (x: number, y: number): number => {
            let m = x;
            let n = y;
            while (n !== 0) {
                const r = m % n;
                m = n;
                n = r;
            }
            return m;
        };

        const divisor = gcd(a, b);
        if (divisor > 0) {
            a = Math.floor(a / divisor);
            b = Math.floor(b / divisor);
        }

        const candidate = `${a}:${b}` as GeminiFlashImageAspectRatio;
        return GEMINI_FLASH_IMAGE_ASPECT_RATIO_SET.has(candidate)
            ? candidate
            : null;
    };

    // Extract aspect ratio hints from user prompt or size references
    const extractAspectRatio = (
        text: string,
    ): GeminiFlashImageAspectRatio | null => {
        const ratioPattern = /\b(\d{1,4})\s*[:xX]\s*(\d{1,4})\b/g;
        let numericMatch: RegExpExecArray | null;
        while ((numericMatch = ratioPattern.exec(text)) !== null) {
            const width = parseInt(numericMatch[1] ?? '', 10);
            const height = parseInt(numericMatch[2] ?? '', 10);
            const normalized = normalizeAspectRatio(width, height);
            if (normalized) return normalized;
        }

        const keywordMatchers: Array<{
            regex: RegExp;
            ratio: GeminiFlashImageAspectRatio;
        }> = [
            { regex: /\bultra[\s-]?wide\b/i, ratio: '21:9' },
            { regex: /\bcinematic\b/i, ratio: '21:9' },
            { regex: /\blandscape\b/i, ratio: '16:9' },
            { regex: /\bwidescreen\b/i, ratio: '16:9' },
            { regex: /\bhorizontal\b/i, ratio: '16:9' },
            { regex: /\bvertical\b/i, ratio: '9:16' },
            { regex: /\bstory\b/i, ratio: '9:16' },
            { regex: /\breel\b/i, ratio: '9:16' },
            { regex: /\bportrait\b/i, ratio: '3:4' },
            { regex: /\bsquare\b/i, ratio: '1:1' },
        ];

        for (const matcher of keywordMatchers) {
            if (matcher.regex.test(text)) return matcher.ratio;
        }

        return null;
    };

    const promptAspectRatio = extractAspectRatio(prompt);

    const configAspectRatio = config?.aspectRatio;
    const manualAspectRatio =
        configAspectRatio && GEMINI_FLASH_IMAGE_ASPECT_RATIO_SET.has(configAspectRatio)
            ? configAspectRatio
            : undefined;

    if (configAspectRatio && !manualAspectRatio) {
        log.warn(
            { userId, aspectRatio: configAspectRatio },
            'Ignoring unsupported Gemini Flash Image aspect ratio override',
        );
    }

    const selectedAspectRatio = manualAspectRatio ?? promptAspectRatio ?? undefined;

    log.info(
        {
            userId,
            userTier,
            selectedAspectRatio,
            manualAspectRatio: Boolean(manualAspectRatio),
        },
        'Generating image with Gemini 2.5 Flash Image',
    );

    const ratioDirective = selectedAspectRatio
        ? `6) Use the ${selectedAspectRatio} aspect ratio for this request.`
        : '6) Default to 16:9 when no aspect ratio is requested.';

    // Strengthen instruction to push image output
    const effectivePrompt = `You are Nano Banana (Gemini 2.5 Flash Image). Follow best practices:
1) Prefer photoreal detail when asked; respect style requests.
2) Compose clean, coherent subjects; avoid duplicated limbs or text.
3) Use consistent lighting; balance foreground and background elements.
4) Preserve existing details when editing reference images.
5) Supported aspect ratios: ${GEMINI_FLASH_IMAGE_ASPECT_RATIO_LIST}.
${ratioDirective}
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

    const googleOptions: {
        responseModalities: Array<'IMAGE' | 'TEXT'>;
        imageConfig?: { aspectRatio: GeminiFlashImageAspectRatio };
    } = { responseModalities: ['IMAGE', 'TEXT'] };

    if (selectedAspectRatio) {
        googleOptions.imageConfig = { aspectRatio: selectedAspectRatio };
    }

    const result = await generateTextAi({
        model,
        providerOptions: {
            google: googleOptions,
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
                ...(selectedAspectRatio ? { aspectRatio: selectedAspectRatio } : {}),
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
                                ...(selectedAspectRatio
                                    ? { aspectRatio: selectedAspectRatio }
                                    : {}),
                            });
                        }
                        const fileData = part?.fileData || part?.file_data;
                        if (fileData?.fileUri && fileData?.mimeType) {
                            outImages.push({
                                mediaType: fileData.mimeType,
                                url: fileData.fileUri,
                                ...(selectedAspectRatio
                                    ? { aspectRatio: selectedAspectRatio }
                                    : {}),
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

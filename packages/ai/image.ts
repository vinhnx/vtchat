import { log } from '@repo/shared/logger';
import { generateText as generateTextAi } from 'ai';
import { ModelEnum } from './model-enum';
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

export type GeminiFlashImageAspectRatio = (typeof GEMINI_FLASH_IMAGE_ASPECT_RATIOS)[number];

const GEMINI_FLASH_IMAGE_ASPECT_RATIO_SET = new Set<GeminiFlashImageAspectRatio>(
    GEMINI_FLASH_IMAGE_ASPECT_RATIOS,
);

const GEMINI_FLASH_IMAGE_ASPECT_RATIO_LIST = GEMINI_FLASH_IMAGE_ASPECT_RATIOS.join(', ');

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

function calculateGcd(x: number, y: number): number {
    let m = x;
    let n = y;
    while (n !== 0) {
        const r = m % n;
        m = n;
        n = r;
    }
    return m;
}

function normalizeAspectRatio(
    width: number,
    height: number,
): GeminiFlashImageAspectRatio | null {
    if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
    if (width <= 0 || height <= 0) return null;

    let a = Math.round(Math.abs(width));
    let b = Math.round(Math.abs(height));

    const divisor = calculateGcd(a, b);
    if (divisor > 0) {
        a = Math.floor(a / divisor);
        b = Math.floor(b / divisor);
    }

    const candidate = `${a}:${b}` as GeminiFlashImageAspectRatio;
    return GEMINI_FLASH_IMAGE_ASPECT_RATIO_SET.has(candidate)
        ? candidate
        : null;
}

function extractAspectRatio(
    text: string,
): GeminiFlashImageAspectRatio | null {
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
}

function convertBase64ToUint8Array(base64String: string): Uint8Array {
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(base64String, 'base64');
    }
    const binaryString = atob(base64String);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function generateGeminiImage(
    params: GenerateGeminiImageParams,
): Promise<GenerateGeminiImageResult> {
    const { prompt, byokKeys, userId, userTier, images, config } = params;

    const model = getLanguageModel(
        ModelEnum.GEMINI_3_FLASH_IMAGE,
        undefined,
        byokKeys,
        false,
        undefined,
        false,
        userTier === 'PLUS',
    );

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
        'Generating image with Gemini 3 Flash Image',
    );

    const ratioDirective = selectedAspectRatio
        ? `6) Use the ${selectedAspectRatio} aspect ratio for this request.`
        : '6) Default to 16:9 when no aspect ratio is requested.';

    // Strengthen instruction to push image output
    const effectivePrompt = `You are Nano Banana (Gemini 3 Flash Image). Follow best practices:
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
                        data: convertBase64ToUint8Array(pure),
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
        imageConfig?: { aspectRatio: GeminiFlashImageAspectRatio; };
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
        for (const file of (result as any).files as any[]) {
            const mediaType: string | undefined = file?.mediaType || file?.mimeType;
            if (!mediaType || !String(mediaType).startsWith('image/')) continue;

            const name: string | undefined = file?.name;
            let url: string | undefined;
            let dataUrl: string | undefined;

            if (typeof file.url === 'string') {
                url = file.url;
            }

            // AI SDK may expose base64 or uint8Array
            if (!url && typeof file.base64 === 'string') {
                dataUrl = `data:${mediaType};base64,${file.base64}`;
            } else if (!url && file.uint8Array && typeof Buffer !== 'undefined') {
                try {
                    const base64 = Buffer.from(file.uint8Array).toString('base64');
                    dataUrl = `data:${mediaType};base64,${base64}`;
                } catch {}
            } else if (!url && file.data && typeof Buffer !== 'undefined') {
                try {
                    const base64 = Buffer.from(file.data).toString('base64');
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

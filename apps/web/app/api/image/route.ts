import { isIP } from 'node:net';

import { auth } from '@/lib/auth-server';
import { getSubscription } from '@/lib/subscription/subscription-access-simple';
import { generateGeminiImage } from '@repo/ai/image';
import {
    createSecureHeaders,
    extractApiKeysFromHeaders,
} from '@repo/shared/constants/security-headers';
import { UserTier, type UserTierType } from '@repo/shared/constants/user-tiers';
import { log } from '@repo/shared/lib/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import { type NextRequest, NextResponse } from 'next/server';

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

type NormalizedImage = {
    base64?: string;
    mediaType?: string;
    url?: string;
    name?: string;
};

enum ImageGenerationErrorCode {
    INVALID_REQUEST = 'INVALID_REQUEST',
    PROMPT_REQUIRED = 'PROMPT_REQUIRED',
    API_KEY_REQUIRED = 'API_KEY_REQUIRED',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}

enum HttpStatus {
    OK = 200,
    BAD_REQUEST = 400,
    FORBIDDEN = 403,
    INTERNAL_SERVER_ERROR = 500,
}

const ERROR_MESSAGES: Record<ImageGenerationErrorCode, string> = {
    [ImageGenerationErrorCode.INVALID_REQUEST]: 'Request body must be valid JSON.',
    [ImageGenerationErrorCode.PROMPT_REQUIRED]: 'Prompt is required for image generation.',
    [ImageGenerationErrorCode.API_KEY_REQUIRED]:
        'Gemini API key required. Add your key in Settings or upgrade to VT+.',
    [ImageGenerationErrorCode.INTERNAL_ERROR]:
        'Unable to generate image right now. Please try again later.',
};

const RESPONSE_HEADERS = {
    ...createSecureHeaders(),
    'Cache-Control': 'no-store',
};

type IpRange = {
    end: number;
    start: number;
};

const ipToInteger = (ip: string): number => {
    return ip.split('.').reduce((accumulator, segment) => {
        return (accumulator << 8) + Number(segment);
    }, 0);
};

const PRIVATE_IPV4_RANGES: IpRange[] = [
    { start: ipToInteger('0.0.0.0'), end: ipToInteger('0.255.255.255') },
    { start: ipToInteger('10.0.0.0'), end: ipToInteger('10.255.255.255') },
    { start: ipToInteger('100.64.0.0'), end: ipToInteger('100.127.255.255') },
    { start: ipToInteger('127.0.0.0'), end: ipToInteger('127.255.255.255') },
    { start: ipToInteger('169.254.0.0'), end: ipToInteger('169.254.255.255') },
    { start: ipToInteger('172.16.0.0'), end: ipToInteger('172.31.255.255') },
    { start: ipToInteger('192.0.0.0'), end: ipToInteger('192.0.0.255') },
    { start: ipToInteger('192.0.2.0'), end: ipToInteger('192.0.2.255') },
    { start: ipToInteger('192.168.0.0'), end: ipToInteger('192.168.255.255') },
    { start: ipToInteger('198.18.0.0'), end: ipToInteger('198.19.255.255') },
];

const isPrivateIpv4 = (ip: string): boolean => {
    const value = ipToInteger(ip);
    return PRIVATE_IPV4_RANGES.some((range) => {
        return value >= range.start && value <= range.end;
    });
};

const isPrivateIpv6 = (ip: string): boolean => {
    const normalized = ip.toLowerCase();

    if (normalized === '::' || normalized === '::1') {
        return true;
    }

    if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
        return true;
    }

    if (normalized.startsWith('fe8') || normalized.startsWith('fe9')) {
        return true;
    }

    if (normalized.startsWith('fea') || normalized.startsWith('feb')) {
        return true;
    }

    if (normalized.startsWith('::ffff:')) {
        return true;
    }

    return false;
};

const isPrivateIpAddress = (hostname: string): boolean => {
    const ipType = isIP(hostname);

    if (ipType === 4) {
        return isPrivateIpv4(hostname);
    }

    if (ipType === 6) {
        return isPrivateIpv6(hostname);
    }

    return false;
};

const isAllowedRemoteImageUrl = (value: string): boolean => {
    let url: URL;

    try {
        url = new URL(value);
    } catch (error) {
        return false;
    }

    if (url.protocol !== 'https:') {
        return false;
    }

    const hostname = url.hostname.trim().toLowerCase();

    if (!hostname || hostname === 'localhost' || hostname.endsWith('.local')) {
        return false;
    }

    if (isPrivateIpAddress(hostname)) {
        return false;
    }

    return true;
};

const sanitizeApiKeys = (
    source?: Record<string, string> | null,
): Record<string, string> => {
    if (!source) {
        return {};
    }

    return Object.entries(source).reduce<Record<string, string>>((acc, [key, value]) => {
        if (typeof value === 'string' && value.trim()) {
            acc[key] = value.trim();
        }
        return acc;
    }, {});
};

const sanitizeImages = (images?: RequestBody['images']): NormalizedImage[] => {
    if (!Array.isArray(images)) {
        return [];
    }

    return images
        .map((image) => {
            const base64 = typeof image.base64 === 'string' ? image.base64.trim() : undefined;
            const mediaType = typeof image.mediaType === 'string' ? image.mediaType.trim() : undefined;
            const url = typeof image.url === 'string' ? image.url.trim() : undefined;
            const name = typeof image.name === 'string' ? image.name.trim() : undefined;

            if (url && !isAllowedRemoteImageUrl(url)) {
                log.warn({ url }, 'Rejected remote image URL for Gemini image generation');
                return {
                    base64,
                    mediaType,
                    name,
                    url: undefined,
                } satisfies NormalizedImage;
            }

            return {
                base64,
                mediaType,
                url,
                name,
            } satisfies NormalizedImage;
        })
        .filter((image) => Boolean(image.base64 || image.url));
};

const getUserTier = async (
    userId?: string,
    planSlug?: string | null,
): Promise<UserTierType> => {
    if (!userId) {
        return UserTier.FREE;
    }

    if (planSlug === PlanSlug.VT_PLUS) {
        return UserTier.PLUS;
    }

    const subscription = await getSubscription(userId);
    if (subscription?.isVtPlus && subscription.isActive) {
        return UserTier.PLUS;
    }

    return UserTier.FREE;
};

const buildErrorResponse = (
    code: ImageGenerationErrorCode,
    status: HttpStatus,
) => {
    return NextResponse.json(
        {
            code,
            error: true,
            message: ERROR_MESSAGES[code],
        },
        {
            status,
            headers: RESPONSE_HEADERS,
        },
    );
};

export async function POST(request: NextRequest) {
    let body: RequestBody;

    try {
        body = (await request.json()) as RequestBody;
    } catch (error) {
        log.warn({ error }, 'Invalid JSON body for image generation request');
        return buildErrorResponse(ImageGenerationErrorCode.INVALID_REQUEST, HttpStatus.BAD_REQUEST);
    }

    const prompt = body.prompt?.toString().trim();
    if (!prompt) {
        return buildErrorResponse(ImageGenerationErrorCode.PROMPT_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const session = await auth.api.getSession({
        headers: request.headers,
    });

    const userId = session?.user?.id;
    const planSlug = session?.user?.planSlug as string | undefined;
    const userTier = await getUserTier(userId, planSlug);

    const headerKeys = extractApiKeysFromHeaders(request.headers);
    const bodyKeys = sanitizeApiKeys(body.apiKeys);
    const combinedKeys = { ...bodyKeys, ...headerKeys };

    const hasGeminiKey = typeof combinedKeys.GEMINI_API_KEY === 'string'
        && combinedKeys.GEMINI_API_KEY.length > 0;

    if (!hasGeminiKey && userTier !== UserTier.PLUS) {
        return buildErrorResponse(ImageGenerationErrorCode.API_KEY_REQUIRED, HttpStatus.FORBIDDEN);
    }

    const sanitizedImages = sanitizeImages(body.images);
    const promptLength = prompt.length;

    log.info(
        {
            userId,
            userTier,
            promptLength,
            imageCount: sanitizedImages.length,
            hasGeminiKey,
            providedApiKeys: Object.keys(combinedKeys),
        },
        'Gemini image generation request received',
    );

    try {
        const result = await generateGeminiImage({
            prompt,
            byokKeys: Object.keys(combinedKeys).length > 0 ? combinedKeys : undefined,
            userId,
            userTier,
            images: sanitizedImages,
        });

        log.info(
            {
                userId,
                userTier,
                hasText: Boolean(result.text),
                imageCount: result.images.length,
            },
            'Gemini image generation succeeded',
        );

        return NextResponse.json(
            {
                text: result.text,
                images: result.images,
            },
            {
                status: HttpStatus.OK,
                headers: RESPONSE_HEADERS,
            },
        );
    } catch (error) {
        log.error(
            {
                error,
                userId,
                userTier,
            },
            'Gemini image generation failed',
        );

        return buildErrorResponse(
            ImageGenerationErrorCode.INTERNAL_ERROR,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}

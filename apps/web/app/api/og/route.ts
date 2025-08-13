import { log } from '@repo/shared/lib/logger';
import ky from 'ky';
import { type NextRequest, NextResponse } from 'next/server';

interface OGData {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    url?: string;
}

const ogCache = new Map<string, OGData>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const cacheTimestamps = new Map<string, number>();

async function fetchOGData(url: string): Promise<OGData | null> {
    try {
        // Check cache first
        const cacheKey = url;
        const cached = ogCache.get(cacheKey);
        const cacheTime = cacheTimestamps.get(cacheKey);

        if (cached && cacheTime && Date.now() - cacheTime < CACHE_TTL) {
            return cached;
        }

        // Special handling for Google Vertex AI Search grounding API URLs
        // These URLs are protected and return 403, so we'll return a default response
        if (url.includes('vertexaisearch.cloud.google.com/grounding-api-redirect')) {
            const ogData: OGData = {
                title: 'Google Search Result',
                description: 'Content from Google Search',
                siteName: 'Google Search',
                url: url,
            };

            // Cache the result
            ogCache.set(cacheKey, ogData);
            cacheTimestamps.set(cacheKey, Date.now());

            return ogData;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        // Using ky for cleaner HTTP requests with built-in error handling
        // Don't throw HTTP errors so we can handle them manually
        const response = await ky.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; VTChat/1.0; +https://vtchat.io.vn)',
            },
            signal: controller.signal,
            timeout: 10000,
            throwHttpErrors: false,
            retry: {
                limit: 2,
                methods: ['get'],
                statusCodes: [408, 413, 429, 500, 502, 503, 504],
            },
        });

        clearTimeout(timeoutId);

        // Check for 403 status and handle gracefully
        if (response.status === 403) {
            const ogData: OGData = {
                title: 'Protected Content',
                description: 'This content is protected and cannot be previewed',
                url: url,
            };

            // Cache the result to avoid repeated failed attempts
            ogCache.set(url, ogData);
            cacheTimestamps.set(url, Date.now());

            return ogData;
        }

        const html = await response.text();

        // Extract OG and meta data using regex (simple but effective)
        const ogData: OGData = {};

        // Extract og:title
        const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
        if (titleMatch) {
            ogData.title = titleMatch[1];
        } else {
            // Fallback to regular title
            const titleFallback = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            if (titleFallback) {
                ogData.title = titleFallback[1];
            }
        }

        // Extract og:description
        const descMatch = html.match(
            /<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i,
        );
        if (descMatch) {
            ogData.description = descMatch[1];
        } else {
            // Fallback to meta description
            const descFallback = html.match(
                /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i,
            );
            if (descFallback) {
                ogData.description = descFallback[1];
            }
        }

        // Extract og:image
        const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
        if (imageMatch) {
            ogData.image = imageMatch[1];
            // Handle relative URLs
            if (ogData.image && !ogData.image.startsWith('http')) {
                const urlObj = new URL(url);
                if (ogData.image.startsWith('//')) {
                    ogData.image = urlObj.protocol + ogData.image;
                } else if (ogData.image.startsWith('/')) {
                    ogData.image = urlObj.origin + ogData.image;
                } else {
                    ogData.image = urlObj.origin + '/' + ogData.image;
                }
            }
        }

        // Extract og:site_name
        const siteNameMatch = html.match(
            /<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"[^>]*>/i,
        );
        if (siteNameMatch) {
            ogData.siteName = siteNameMatch[1];
        }

        // Extract og:url
        const urlMatch = html.match(/<meta[^>]*property="og:url"[^>]*content="([^"]*)"[^>]*>/i);
        if (urlMatch) {
            ogData.url = urlMatch[1];
        } else {
            ogData.url = url;
        }

        // Cache the result
        ogCache.set(cacheKey, ogData);
        cacheTimestamps.set(cacheKey, Date.now());

        return ogData;
    } catch (error: any) {
        // Handle network errors, timeouts, etc.
        if (process.env.NODE_ENV === 'development') {
            log.warn({ url, error: error?.message || error }, 'Failed to fetch OG data');
        }
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        const ogData = await fetchOGData(url);

        if (!ogData) {
            return NextResponse.json({ error: 'Failed to fetch OG data' }, { status: 404 });
        }

        return NextResponse.json(ogData, {
            headers: {
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        log.error({ error }, 'Error in OG API');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

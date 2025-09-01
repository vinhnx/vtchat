'use client';

import type { Source } from '@repo/shared/types';
import { getHost } from '@repo/shared/utils';
import { log } from '@repo/shared/src/lib/logger';
import { HoverCard, HoverCardContent, HoverCardTrigger, LinkFavicon } from '@repo/ui';
import { ExternalLink } from 'lucide-react';
import type React from 'react';
import { memo, useEffect, useState } from 'react';

interface OGData {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    url?: string;
}

// Use a more robust cache key to prevent collisions
const ogCache = new Map<string, OGData>();
const ogCacheTimestamps = new Map<string, number>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// Function to normalize URL for consistent caching
const normalizeUrl = (url: string): string => {
    try {
        const urlObj = new URL(url.trim());
        // Remove common tracking parameters
        urlObj.searchParams.delete('utm_source');
        urlObj.searchParams.delete('utm_medium');
        urlObj.searchParams.delete('utm_campaign');
        urlObj.searchParams.delete('utm_content');
        urlObj.searchParams.delete('utm_term');
        urlObj.searchParams.delete('ref');
        urlObj.searchParams.delete('source');
        // Ensure consistent URL format
        return urlObj.toString().toLowerCase();
    } catch {
        // If URL parsing fails, just clean the string
        return url.trim().toLowerCase();
    }
};

// Generate a unique cache key that includes source context
const generateCacheKey = (source: Source): string => {
    const normalizedUrl = normalizeUrl(source.link);
    // Include source index as primary differentiator to prevent cross-contamination
    // Even if URLs are the same, different sources should have different cache entries
    return `${normalizedUrl}::index_${source.index || 'unknown'}::title_${
        (source.title || '').substring(0, 50)
    }`;
};

// Function to check if cache entry is valid
const isCacheValid = (url: string): boolean => {
    const timestamp = ogCacheTimestamps.get(url);
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_TTL;
};

// Function to clear cache for debugging
export const clearOGCache = () => {
    ogCache.clear();
    ogCacheTimestamps.clear();
    if (process.env.NODE_ENV === 'development') {
        log.debug({ cacheSize: 0 }, 'OG cache cleared for debugging');
    }
};

// Function to inspect cache for debugging
export const inspectOGCache = () => {
    const entries = Array.from(ogCache.entries());
    if (process.env.NODE_ENV === 'development') {
        log.debug({ 
            cacheSize: entries.length,
            cacheKeys: entries.map(([key]) => key.substring(0, 100) + '...') 
        }, 'OG cache inspection');
    }
    return entries;
};

export type LinkPreviewType = {
    source: Source;
    children: React.ReactNode;
};

export const LinkPreviewPopover = memo(({ source, children }: LinkPreviewType) => {
    if (!source?.link?.trim()?.length) {
        return null;
    }

    return (
        <HoverCard closeDelay={100} openDelay={200}>
            <HoverCardTrigger className='cursor-pointer'>{children}</HoverCardTrigger>
            <HoverCardContent
                className='prose-none bg-background hover:border-hard group isolate z-[100] w-[400px] cursor-pointer rounded-xl p-0 shadow-2xl'
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open(source.link, '_blank');
                }}
            >
                <ExternalLink
                    className='text-muted-foreground group-hover:text-brand absolute right-3 top-3'
                    size={14}
                />
                <LinkPreview source={source} />
            </HoverCardContent>
        </HoverCard>
    );
});

export const LinkPreview = memo(({ source }: { source: Source; }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [ogResult, setOgResult] = useState<OGData | null>(null);
    const [imageError, setImageError] = useState(false);

    const fetchOg = async (source: Source) => {
        try {
            // Create a unique cache key that includes source context
            const cacheKey = generateCacheKey(source);
            const url = source.link;

            // Check if we have valid cached data
            if (ogCache.has(cacheKey) && isCacheValid(cacheKey)) {
                const cachedData = ogCache.get(cacheKey);
                setOgResult(cachedData || null);
                return;
            }

            // Clear expired cache entry if it exists
            if (ogCache.has(cacheKey) && !isCacheValid(cacheKey)) {
                ogCache.delete(cacheKey);
                ogCacheTimestamps.delete(cacheKey);
            }
            setIsLoading(true);

            const res = await fetch(`/api/og?url=${encodeURIComponent(url)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.ok) {
                const data = await res.json();
                // Store with timestamp
                ogCache.set(cacheKey, data);
                ogCacheTimestamps.set(cacheKey, Date.now());
                setOgResult(data);
            } else {
                setOgResult(null);
            }
        } catch {
            setOgResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        // Reset OG result when source changes
        setOgResult(null);
        setImageError(false);

        if (mounted && source.link) {
            fetchOg(source);
        }

        return () => {
            mounted = false;
        };
    }, [source.link, source.title, source.snippet, source.index]); // Depend on all source properties that affect cache key

    if (isLoading) {
        return (
            <div className='not-prose overflow-hidden'>
                <div className='flex w-full animate-pulse flex-col items-start'>
                    <div className='bg-muted/20 h-32 w-full rounded-t-xl' />
                    <div className='flex min-h-[120px] w-full flex-col gap-2 p-4'>
                        <div className='flex h-4 w-full items-center gap-1.5'>
                            <div className='bg-muted h-4 w-4 rounded-full' />
                            <div className='bg-muted h-3 w-24 rounded' />
                        </div>
                        <div className='flex h-8 w-full items-start'>
                            <div className='bg-muted h-4 w-3/4 rounded' />
                        </div>
                        <div className='flex w-full flex-1 items-start'>
                            <div className='bg-muted h-3 w-1/2 rounded' />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const displayTitle = ogResult?.title || source.title;
    const displayDescription = ogResult?.description || source.snippet;
    const siteName = ogResult?.siteName || getHost(source.link);

    return (
        <div className='not-prose overflow-hidden'>
            <div className='flex flex-col items-start'>
                {/* OG Image - Always show container for consistent height */}
                <div className='bg-muted/20 h-32 w-full overflow-hidden rounded-t-xl'>
                    {ogResult?.image && !imageError
                        ? (
                            <img
                                src={ogResult.image}
                                alt={displayTitle || 'Preview'}
                                className='h-full w-full object-cover'
                                onError={() => setImageError(true)}
                                loading='lazy'
                            />
                        )
                        : (
                            <img
                                src='/bg/bg_vt.jpeg'
                                alt='Link preview'
                                className='h-full w-full object-cover opacity-30'
                                loading='lazy'
                            />
                        )}
                </div>

                {/* Content */}
                <div className='flex min-h-[120px] w-full flex-col items-start gap-2 p-4'>
                    {/* Site info */}
                    <div className='flex h-4 flex-row items-center gap-1.5'>
                        <LinkFavicon link={source.link} />
                        <p className='text-muted-foreground line-clamp-1 w-full font-sans text-xs'>
                            {siteName}
                        </p>
                    </div>

                    {/* Title */}
                    <div className='flex h-8 w-full items-start'>
                        <p className='text-foreground line-clamp-2 w-full overflow-hidden font-sans text-sm font-semibold leading-tight'>
                            {displayTitle || 'Link Preview'}
                        </p>
                    </div>

                    {/* Description */}
                    <div className='flex w-full flex-1 items-start'>
                        <p className='text-muted-foreground line-clamp-2 w-full font-sans text-xs leading-relaxed'>
                            {displayDescription || 'No description available for this link.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

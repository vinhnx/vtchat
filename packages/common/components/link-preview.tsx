"use client";

import type { Source } from "@repo/shared/types";
import { getHost } from "@repo/shared/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger, LinkFavicon } from "@repo/ui";
import { ExternalLink } from "lucide-react";
import type React from "react";
import { memo, useEffect, useState } from "react";

interface OGData {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    url?: string;
}

const ogCache = new Map<string, OGData>();

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
            <HoverCardTrigger className="cursor-pointer">{children}</HoverCardTrigger>
            <HoverCardContent
                className="prose-none bg-background hover:border-hard group isolate z-[100] w-[400px] cursor-pointer rounded-xl p-0 shadow-2xl"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open(source.link, "_blank");
                }}
            >
                <ExternalLink
                    className="text-muted-foreground group-hover:text-brand absolute right-3 top-3"
                    size={14}
                />
                <LinkPreview source={source} />
            </HoverCardContent>
        </HoverCard>
    );
});

export const LinkPreview = memo(({ source }: { source: Source }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [ogResult, setOgResult] = useState<OGData | null>(null);
    const [imageError, setImageError] = useState(false);

    const fetchOg = async (url: string) => {
        try {
            if (ogCache.has(url)) {
                setOgResult(ogCache.get(url) || null);
                return;
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
                ogCache.set(url, data);
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

        if (!ogResult && !isLoading && mounted) {
            fetchOg(source.link);
        }

        return () => {
            mounted = false;
        };
    }, [source.link, ogResult, isLoading]);

    if (isLoading) {
        return (
            <div className="flex w-full animate-pulse flex-col items-start">
                <div className="bg-muted/20 h-32 w-full rounded-t-xl" />
                <div className="flex w-full flex-col gap-2 p-4">
                    <div className="flex w-full items-center gap-1.5">
                        <div className="bg-muted h-4 w-4 rounded-full" />
                        <div className="bg-muted h-3 w-24 rounded" />
                    </div>
                    <div className="bg-muted h-4 w-3/4 rounded" />
                    <div className="bg-muted h-3 w-1/2 rounded" />
                </div>
            </div>
        );
    }

    const displayTitle = ogResult?.title || source.title;
    const displayDescription = ogResult?.description || source.snippet;
    const siteName = ogResult?.siteName || getHost(source.link);

    return (
        <div className="not-prose overflow-hidden">
            <div className="flex flex-col items-start">
                {/* OG Image */}
                {ogResult?.image && !imageError && (
                    <div className="w-full">
                        <img
                            src={ogResult.image}
                            alt={displayTitle || 'Preview'}
                            className="h-32 w-full rounded-t-xl object-cover"
                            onError={() => setImageError(true)}
                            loading="lazy"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex w-full flex-col items-start gap-2 p-4">
                    {/* Site info */}
                    <div className="flex flex-row items-center gap-1.5">
                        <LinkFavicon link={source.link} />
                        <p className="text-muted-foreground line-clamp-1 w-full font-sans text-xs">
                            {siteName}
                        </p>
                    </div>

                    {/* Title */}
                    {displayTitle && (
                        <p className="text-foreground line-clamp-2 w-full overflow-hidden font-sans text-sm font-semibold leading-tight">
                            {displayTitle}
                        </p>
                    )}

                    {/* Description */}
                    {displayDescription && (
                        <p className="text-muted-foreground line-clamp-2 w-full font-sans text-xs leading-relaxed">
                            {displayDescription}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
});

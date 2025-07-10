'use client';

import type { Source } from '@repo/shared/types';
import { createContext, type PropsWithChildren, useEffect, useState } from 'react';

export type Citation = {
    url: string;
    host: string;
    favIcon: string;
    index: number;
    isExtra?: boolean;
    extraCount?: number;
};

export const isValidUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch (_error) {
        return false;
    }
};

const _getHost = (url: string) => {
    try {
        return new URL(url).hostname;
    } catch (_error) {
        return null;
    }
};

const _getFavIcon = (host?: string) => {
    if (!host) {
        return null;
    }
    // Skip favicon for grounding API redirects
    if (
        host.includes('vertexaisearch.cloud.google.com') ||
        host.includes('grounding-api-redirect')
    ) {
        return null;
    }
    try {
        return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
    } catch (_error) {
        return null;
    }
};

export type CitationProviderContextType = {
    sources: Source[];
    getSourceByIndex: (index: number) => Source | undefined;
};

export const CitationProviderContext = createContext<CitationProviderContextType>({
    sources: [],
    getSourceByIndex: () => {},
});

export const CitationProvider = ({
    sources,
    children,
}: PropsWithChildren<{ sources?: Source[] }>) => {
    const [sourceList, setSourceList] = useState<Source[]>([]);

    useEffect(() => {
        if (sources && Array.isArray(sources)) {
            setSourceList(sources);
        }
    }, [sources]);

    const getSourceByIndex = (index: number) => {
        return sourceList.find((source) => source.index === index);
    };

    return (
        <CitationProviderContext.Provider value={{ sources: sourceList, getSourceByIndex }}>
            {children}
        </CitationProviderContext.Provider>
    );
};

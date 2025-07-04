import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://vtchat.io.vn';

interface MetadataConfig {
    title?: string;
    description?: string;
    pathname?: string;
    keywords?: string;
    image?: string;
    noIndex?: boolean;
}

export function generateMetadata({
    title = 'VT',
    description = 'Minimal AI chat application.',
    pathname = '',
    keywords,
    image = '/og-image.jpg',
    noIndex = false,
}: MetadataConfig = {}): Metadata {
    const canonicalUrl = `${BASE_URL}${pathname}`;
    const fullTitle = pathname ? `${title} | VT` : title;

    // Use a static version for consistent caching but allow manual updates
    // File Renaming Strategy:
    // example: og-image-v2.jpg  // New file when image changes
    const imageVersion = '1704109200'; // Timestamp for cache busting -> update when needed

    return {
        title: fullTitle,
        description,
        keywords:
            keywords ||
            'agent, ai, chatbot, assistant, openai, multimodal, tool-use, llm, llms, function-calling',
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: fullTitle,
            description,
            url: canonicalUrl,
            siteName: 'VT',
            type: 'website',
            locale: 'en_US',
            images: [
                {
                    url: `${BASE_URL}${image}?v=${imageVersion}`,
                    width: 1200,
                    height: 630,
                    alt: `${title} Preview`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [`${BASE_URL}/twitter-image.jpg?v=${imageVersion}`],
        },
        robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    };
}

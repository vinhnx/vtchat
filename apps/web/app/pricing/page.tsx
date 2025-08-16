import { Footer } from '@repo/common/components';
import type { Metadata } from 'next';
import { PricingClient } from './pricing-client';

// This page can be statically generated for better SEO
export const dynamic = 'force-static';

export const metadata: Metadata = {
    title: 'AI Platform Pricing - Advanced Artificial Intelligence Features | VT',
    description:
        'VT AI platform pricing: Most artificial intelligence features free with BYOK including generative AI, deep learning, and natural language processing (NLP). VT+ adds professional AI research tools with large language models (LLMs) and machine learning capabilities.',
    keywords: [
        'ai platform pricing',
        'artificial intelligence pricing',
        'generative ai pricing',
        'deep learning pricing',
        'natural language processing nlp pricing',
        'large language models llms pricing',
        'machine learning pricing',
        'ai systems pricing',
        'VT pricing',
        'AI chat pricing',
        'BYOK AI',
        'free AI models',
        'premium AI features',
        'research tools',
        'AI subscription',
        'professional AI tools',
        'custom workflows',
        'priority access',
    ],
    openGraph: {
        title: 'AI Platform Pricing - Advanced Artificial Intelligence Features',
        description:
            'Most powerful artificial intelligence features free with BYOK including generative AI, deep learning, and natural language processing. VT+ adds professional AI research capabilities with large language models.',
        type: 'website',
        images: [
            {
                url: 'https://vtchat.io.vn/og-image-v3.jpg',
                width: 1200,
                height: 630,
                alt: 'VT AI Platform Pricing - Advanced Artificial Intelligence Features',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Platform Pricing - Advanced Artificial Intelligence Features',
        description:
            'Most powerful artificial intelligence features free with BYOK including generative AI, deep learning, and natural language processing. VT+ adds professional AI research capabilities.',
        images: ['https://vtchat.io.vn/twitter-image-v3.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://vtchat.io.vn/pricing',
    },
};

export default function PricingPage() {
    return (
        <>
            <h1
                style={{
                    position: 'absolute',
                    left: '-10000px',
                    top: 'auto',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                }}
            >
                AI Platform Pricing - Advanced Artificial Intelligence with Generative AI & Deep
                Learning
            </h1>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: 'VT+',
                        description:
                            'Premium AI chat features with exclusive research capabilities',
                        brand: {
                            '@type': 'Brand',
                            name: 'VT',
                        },
                        offers: {
                            '@type': 'Offer',
                            price: '10',
                            priceCurrency: 'USD',
                            availability: 'https://schema.org/InStock',
                            priceValidUntil: '2025-12-31',
                            url: 'https://vtchat.io.vn/pricing',
                        },
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: '4.8',
                            reviewCount: '150',
                            bestRating: '5',
                            worstRating: '1',
                        },
                    }),
                }}
            />
            <PricingClient />
            {/* Footer */}
            <Footer />
        </>
    );
}

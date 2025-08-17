import { GatedThemeProvider, RootLayout, SSRErrorBoundary } from '@repo/common/components';
import { PlusDefaultsProvider } from '@repo/common/components/plus-defaults-provider';
import { RootProvider } from '@repo/common/context';
import { AccessibilityProvider } from '@repo/common/contexts/accessibility-context';
import { OptimizedAuthProvider } from '@repo/common/providers';
import { SubscriptionProvider } from '@repo/common/providers/subscription-provider';
import { TooltipProvider } from '@repo/ui';
import { RootProvider as FumadocsRootProvider } from 'fumadocs-ui/provider';
import type { Metadata, Viewport } from 'next';
import { BetterAuthProvider } from '../components/better-auth-provider';
import { OfflineIndicator } from '../components/offline-indicator';
import { PerformanceOptimizations } from '../components/performance-optimizations';
import { PWAManager } from '../components/pwa-manager';
import { ReactScan } from '../components/react-scan';

// Force dynamic rendering for all pages to avoid context issues during build
export const dynamic = 'force-dynamic';

import '@repo/ui/src/styles.css';
import { AccessibilityHead } from '../components/accessibility-improvements';
import './globals.css';
import { defaultMetadata, defaultViewport } from './page-metadata';

export const metadata: Metadata = defaultMetadata;
export const viewport: Viewport = defaultViewport;

// Remove duplicate font definitions - already defined above

export default function ParentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <head>
                <PerformanceOptimizations />
                <AccessibilityHead />
                {/* Additional meta tags for better search engine recognition */}
                <meta name='theme-color' content='#ffffff' />
                <meta name='msapplication-TileColor' content='#ffffff' />
                <meta name='msapplication-TileImage' content='/icon-512x512.png' />

                {/* Preload critical favicon for faster loading */}
                <link rel='preload' href='/favicon.ico' as='image' type='image/x-icon' />
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'VT - Advanced AI Platform',
                            url: 'https://vtchat.io.vn',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://vtchat.io.vn/icon-512x512.png',
                                width: 512,
                                height: 512,
                            },
                            description:
                                'Advanced AI chat platform with generative AI, deep learning, natural language processing (NLP), and large language models (LLMs). Privacy-first artificial intelligence systems for real-time AI processing.',
                            foundingDate: '2025',
                            contactPoint: {
                                '@type': 'ContactPoint',
                                url: 'https://vtchat.io.vn/hello',
                                contactType: 'customer service',
                            },
                            sameAs: ['https://github.com/vinhnx/vtchat', 'https://x.com/vinhnx'],
                            keywords:
                                'artificial intelligence, AI, generative AI, deep learning, machine learning, natural language processing, large language models, computer vision, AI systems',
                        }),
                    }}
                />
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: 'VT - Advanced AI Platform',
                            url: 'https://vtchat.io.vn',
                            description:
                                'Advanced AI chat platform with generative AI, deep learning, and natural language processing capabilities. Experience artificial intelligence with large language models and machine learning.',
                            potentialAction: {
                                '@type': 'SearchAction',
                                target: {
                                    '@type': 'EntryPoint',
                                    urlTemplate: 'https://vtchat.io.vn/chat?q={search_term_string}',
                                },
                                'query-input': 'required name=search_term_string',
                            },
                        }),
                    }}
                />
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@graph': [
                                {
                                    '@type': 'Organization',
                                    '@id': 'https://vtchat.io.vn/#organization',
                                    name: 'VT - Advanced AI Platform',
                                    alternateName: 'VT AI',
                                    url: 'https://vtchat.io.vn',
                                    logo: {
                                        '@type': 'ImageObject',
                                        url: 'https://vtchat.io.vn/icon-512x512.png',
                                        width: 512,
                                        height: 512,
                                        caption: 'VT AI Platform Logo',
                                    },
                                    description:
                                        'Advanced AI chat platform with generative AI, deep learning, natural language processing (NLP), and large language models (LLMs). Privacy-first artificial intelligence systems for real-time AI processing.',
                                    foundingDate: '2025',
                                    contactPoint: {
                                        '@type': 'ContactPoint',
                                        url: 'https://vtchat.io.vn/hello',
                                        contactType: 'customer service',
                                        areaServed: 'Worldwide',
                                        availableLanguage: 'English',
                                    },
                                    sameAs: [
                                        'https://github.com/vinhnx/vtchat',
                                        'https://x.com/vinhnx',
                                    ],
                                    keywords:
                                        'artificial intelligence, AI, generative AI, deep learning, machine learning, natural language processing, large language models, computer vision, AI systems',
                                    industry: 'Artificial Intelligence',
                                },
                                {
                                    '@type': 'WebSite',
                                    '@id': 'https://vtchat.io.vn/#website',
                                    url: 'https://vtchat.io.vn',
                                    name: 'VT - Advanced AI Platform',
                                    description:
                                        'Advanced AI chat platform with generative AI, deep learning, and natural language processing capabilities. Experience artificial intelligence with large language models and machine learning.',
                                    publisher: { '@id': 'https://vtchat.io.vn/#organization' },
                                    inLanguage: 'en-US',
                                    potentialAction: {
                                        '@type': 'SearchAction',
                                        target: {
                                            '@type': 'EntryPoint',
                                            urlTemplate:
                                                'https://vtchat.io.vn/chat?q={search_term_string}',
                                        },
                                        'query-input': 'required name=search_term_string',
                                    },
                                },
                                {
                                    '@type': 'SoftwareApplication',
                                    name: 'VT - Advanced AI Chat Platform',
                                    url: 'https://vtchat.io.vn',
                                    description:
                                        'Advanced artificial intelligence chat platform with generative AI, deep learning, and natural language processing. Features large language models (LLMs), machine learning capabilities, and real-time AI processing.',
                                    applicationCategory: 'AI Chat Application',
                                    operatingSystem: 'Web Browser, Cross-platform',
                                    softwareVersion: '1.0',
                                    datePublished: '2025-01-01',
                                    author: {
                                        '@type': 'Person',
                                        name: 'Vinh Nguyen',
                                        url: 'https://vinhnx.github.io/',
                                    },
                                    publisher: { '@id': 'https://vtchat.io.vn/#organization' },
                                    offers: {
                                        '@type': 'Offer',
                                        price: '0',
                                        priceCurrency: 'USD',
                                        description: 'Free AI chat with premium models',
                                        availability: 'https://schema.org/InStock',
                                    },
                                    featureList: [
                                        'Generative AI',
                                        'Deep Learning',
                                        'Natural Language Processing (NLP)',
                                        'Large Language Models (LLMs)',
                                        'Machine Learning Models',
                                        'Computer Vision',
                                        'Real-time AI Processing',
                                        'Privacy-first AI Systems',
                                    ],
                                    screenshot: {
                                        '@type': 'ImageObject',
                                        url: 'https://vtchat.io.vn/og-image-v3.jpg',
                                        caption: 'VT AI Chat Interface Screenshot',
                                    },
                                    aggregateRating: {
                                        '@type': 'AggregateRating',
                                        ratingValue: '4.9',
                                        reviewCount: '200',
                                        bestRating: '5',
                                        worstRating: '1',
                                    },
                                },
                            ],
                        }),
                    }}
                />
            </head>
            <body className='bg-background text-foreground antialiased'>
                <GatedThemeProvider
                    attribute='class'
                    defaultTheme='light'
                    disableTransitionOnChange={false}
                    enableColorScheme={false}
                    enableSystem={true}
                    storageKey='vt-theme'
                >
                    <TooltipProvider>
                        <AccessibilityProvider>
                            <SSRErrorBoundary>
                                <BetterAuthProvider>
                                    <OptimizedAuthProvider>
                                        <SubscriptionProvider>
                                            <PlusDefaultsProvider>
                                                <RootProvider>
                                                    <FumadocsRootProvider
                                                        search={{ enabled: false }}
                                                    >
                                                        {/* React Scan for performance monitoring in development */}
                                                        <ReactScan />
                                                        {/* PWA Manager for install prompts and service worker */}
                                                        <PWAManager />
                                                        {/* Offline status indicator */}
                                                        <OfflineIndicator />
                                                        {/* @ts-ignore - Type compatibility issue between React versions */}
                                                        <RootLayout>
                                                            <main className='flex flex-1 flex-col'>
                                                                {children}
                                                            </main>
                                                        </RootLayout>
                                                    </FumadocsRootProvider>
                                                </RootProvider>
                                            </PlusDefaultsProvider>
                                        </SubscriptionProvider>
                                    </OptimizedAuthProvider>
                                </BetterAuthProvider>
                            </SSRErrorBoundary>
                        </AccessibilityProvider>
                    </TooltipProvider>
                </GatedThemeProvider>
            </body>
        </html>
    );
}

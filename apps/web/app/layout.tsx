import { GatedThemeProvider, RootLayout, SSRErrorBoundary } from '@repo/common/components';
import { PlusDefaultsProvider } from '@repo/common/components/plus-defaults-provider';
import { RootProvider } from '@repo/common/context';
import { AccessibilityProvider } from '@repo/common/contexts/accessibility-context';
import { OptimizedAuthProvider } from '@repo/common/providers';
import { SubscriptionProvider } from '@repo/common/providers/subscription-provider';
import { TooltipProvider } from '@repo/ui';
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
                <meta name='msapplication-TileImage' content='/icon-512.png' />

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
                                url: 'https://vtchat.io.vn/icon-512.png',
                                width: 512,
                                height: 512,
                            },
                            description:
                                'Advanced AI chat platform with generative AI, deep learning, natural language processing (NLP), and large language models (LLMs). Privacy-first artificial intelligence systems for real-time AI processing.',
                            foundingDate: '2025',
                            contactPoint: {
                                '@type': 'ContactPoint',
                                email: 'hello@vtchat.io.vn',
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
                            '@type': 'SoftwareApplication',
                            name: 'VT - Advanced AI Chat Platform',
                            url: 'https://vtchat.io.vn',
                            description:
                                'Advanced artificial intelligence chat platform with generative AI, deep learning, and natural language processing. Features large language models (LLMs), machine learning capabilities, and real-time AI processing.',
                            applicationCategory: 'AI Chat Application',
                            operatingSystem: 'Web Browser',
                            offers: {
                                '@type': 'Offer',
                                price: '0',
                                priceCurrency: 'USD',
                                description: 'Free AI chat with premium models',
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

import {
    FullPageLoader,
    GatedThemeProvider,
    NoSSR,
    RootLayout,
    SSRErrorBoundary,
    VemetricAuthProvider,
    VemetricSettingsTracker,
    VemetricSubscriptionTracker,
} from '@repo/common/components';
import { PlusDefaultsProvider } from '@repo/common/components/plus-defaults-provider';
import { RootProvider } from '@repo/common/context';
import { OptimizedAuthProvider } from '@repo/common/providers';
import { SubscriptionProvider } from '@repo/common/providers/subscription-provider';
import { cn, SonnerToaster, TooltipProvider } from '@repo/ui';
import { VemetricScript } from '@vemetric/react';
import { GeistMono } from 'geist/font/mono';
import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter } from 'next/font/google';
import { BetterAuthProvider } from '../components/better-auth-provider';
import { PerformanceOptimizations } from '../components/performance-optimizations';
import { ReactScan } from '../components/react-scan';

// Force dynamic rendering to prevent SSR issues during build
export const dynamic = 'force-dynamic';

const bricolage = Bricolage_Grotesque({
    subsets: ['latin'],
    variable: '--font-bricolage',
});

import '@repo/ui/src/styles.css';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://vtchat.io.vn'),
    title: 'VT',
    description: 'Minimal AI chat application.',
    keywords:
        'agent, ai, chatbot, assistant, openai, multimodal, tool-use, llm, llms, function-calling',
    authors: [{ name: 'Vinh Nguyen', url: 'https://vinhnx.github.io/' }],
    creator: 'Vinh Nguyen',
    publisher: 'Vinh Nguyen',
    openGraph: {
        title: 'VT',
        siteName: 'VT',
        description: 'Minimal AI chat application.',
        url: 'https://vtchat.io.vn',
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: `https://vtchat.io.vn/og-image.jpg?v=${Date.now()}`,
                width: 1200,
                height: 630,
                alt: 'VT Preview',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'VT',
        site: 'VT',
        creator: '@vinhnx',
        description: 'Minimal AI chat application.',
        images: [`https://vtchat.io.vn/twitter-image.jpg?v=${Date.now()}`],
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
        canonical: 'https://vtchat.io.vn',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    interactiveWidget: 'resizes-content',
};

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const clash = Bricolage_Grotesque({
    subsets: ['latin'],
    variable: '--font-clash',
});

export default function ParentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            className={cn(GeistMono.variable, inter.variable, clash.variable, bricolage.variable)}
            lang="en"
            suppressHydrationWarning
        >
            <head>
                <PerformanceOptimizations />
                {/* Primary Analytics: Vemetric (Vercel Analytics disabled) */}
                <VemetricScript token={process.env.NEXT_PUBLIC_VEMETRIC_TOKEN || ''} />
                <link href="/favicon.ico" rel="icon" sizes="any" />
            </head>
            <body className="bg-background text-foreground antialiased">
                <GatedThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    disableTransitionOnChange={false}
                    enableColorScheme={false}
                    enableSystem={true}
                    storageKey="vt-theme"
                >
                    <TooltipProvider>
                        <SSRErrorBoundary>
                            <BetterAuthProvider>
                                <NoSSR
                                    fallback={
                                        <div className="z-20 flex min-h-[90vh] w-full flex-1 flex-col items-center justify-center gap-4">
                                            <FullPageLoader label="Loading..." />
                                        </div>
                                    }
                                >
                                    <OptimizedAuthProvider>
                                        <SubscriptionProvider>
                                            <PlusDefaultsProvider>
                                                <RootProvider>
                                                    {/* React Scan for performance monitoring in development */}
                                                    <ReactScan />
                                                    {/* @ts-ignore - Type compatibility issue between React versions */}
                                                    <RootLayout>
                                                        <VemetricAuthProvider>
                                                            <VemetricSubscriptionTracker />
                                                            <VemetricSettingsTracker />
                                                            {children}
                                                        </VemetricAuthProvider>
                                                    </RootLayout>
                                                    <SonnerToaster />
                                                </RootProvider>
                                            </PlusDefaultsProvider>
                                        </SubscriptionProvider>
                                    </OptimizedAuthProvider>
                                </NoSSR>
                            </BetterAuthProvider>
                        </SSRErrorBoundary>
                    </TooltipProvider>
                </GatedThemeProvider>
            </body>
        </html>
    );
}

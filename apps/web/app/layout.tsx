import {
    FullPageLoader,
    NoSSR,
    RootLayout,
    SSRErrorBoundary,
    ThemeProvider,
} from '@repo/common/components';
import { RootProvider } from '@repo/common/context';
import { OptimizedAuthProvider } from '@repo/common/providers';
import { SubscriptionProvider } from '@repo/common/providers/subscription-provider';
import { PlusDefaultsProvider } from '@repo/common/components/plus-defaults-provider';
import { cn, TooltipProvider } from '@repo/ui';
import { GeistMono } from 'geist/font/mono';
import type { Viewport } from 'next';
import { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import localFont from 'next/font/local';
import { BetterAuthProvider } from '../components/better-auth-provider';

// Force dynamic rendering to prevent SSR issues during build
export const dynamic = 'force-dynamic';

const bricolage = Bricolage_Grotesque({
    subsets: ['latin'],
    variable: '--font-bricolage',
});

import '@repo/ui/src/styles.css';
import './globals.css';

export const metadata: Metadata = {
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
                url: 'https://vtchat.io.vn/og-image.jpg',
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
        images: ['https://vtchat.io.vn/twitter-image.jpg'],
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
};

const inter = localFont({
    src: './InterVariable.woff2',
    variable: '--font-inter',
});

const clash = localFont({
    src: './ClashGrotesk-Variable.woff2',
    variable: '--font-clash',
});

export default function ParentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={cn(GeistMono.variable, inter.variable, clash.variable, bricolage.variable)}
            suppressHydrationWarning
        >
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className="bg-background text-foreground antialiased">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem={true}
                    disableTransitionOnChange={false}
                    storageKey="vt-theme"
                    enableColorScheme={false}
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
                                                    {/* @ts-ignore - Type compatibility issue between React versions */}
                                                    <RootLayout>{children}</RootLayout>
                                                </RootProvider>
                                            </PlusDefaultsProvider>
                                        </SubscriptionProvider>
                                    </OptimizedAuthProvider>
                                </NoSSR>
                            </BetterAuthProvider>
                        </SSRErrorBoundary>
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

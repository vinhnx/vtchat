import { BetterAuthProvider } from '@/components/better-auth-provider';
import { CreditsProvider, RootLayout, ThemeProvider } from '@repo/common/components';
import { ReactQueryProvider, RootProvider } from '@repo/common/context';
import { TooltipProvider, cn } from '@repo/ui';
import { GeistMono } from 'geist/font/mono';
import type { Viewport } from 'next';
import { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import localFont from 'next/font/local';

const bricolage = Bricolage_Grotesque({
    subsets: ['latin'],
    variable: '--font-bricolage',
});

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
            <body>
                <BetterAuthProvider>
                    <RootProvider>
                        <CreditsProvider>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                                disableTransitionOnChange
                            >
                                <TooltipProvider>
                                    <ReactQueryProvider>
                                        <RootLayout>{children}</RootLayout>
                                    </ReactQueryProvider>
                                </TooltipProvider>
                            </ThemeProvider>
                        </CreditsProvider>
                    </RootProvider>
                </BetterAuthProvider>
            </body>
        </html>
    );
}

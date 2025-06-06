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
    title: 'VT.ai - multimodal AI chat app with dynamic conversation routing',
    description:
        'VT.ai is a multimodal AI chat application designed to simplify interaction with different AI models through a unified interface.',
    keywords:
        'agent, ai, chatbot, assistant, openai, llama, multimodal, tool-use, llm, llms, function-calling, ollama',
    authors: [{ name: 'Vinh Nguyen', url: 'https://vinhnx.github.io/' }],
    creator: 'Vinh Nguyen',
    publisher: 'Vinh Nguyen',
    openGraph: {
        title: 'VT.ai - multimodal AI chat app with dynamic conversation routing',
        siteName: 'VT.ai',
        description:
            'VT.ai is a multimodal AI chat application designed to simplify interaction with different AI models through a unified interface.',
        url: 'https://vtai.vn',
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: 'https://vtai.vn/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'VT.ai Preview',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'VT.ai - Go Deeper with AI-Powered Research & Agentic Workflows',
        site: 'VT.ai',
        creator: '@llmchat_co',
        description:
            'Experience deep, AI-powered research with agentic workflows and a wide variety of models for advanced productivity.',
        images: ['https://vtai.vn/twitter-image.jpg'],
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
        canonical: 'https://VT',
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

                {/* <script
                    crossOrigin="anonymous"
                    src="//unpkg.com/react-scan/dist/auto.global.js"
                ></script> */}
            </head>
            <body>
                {/* <PostHogProvider> */}
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
                {/* </PostHogProvider> */}
            </body>
        </html>
    );
}

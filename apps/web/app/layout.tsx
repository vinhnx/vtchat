import {
    FullPageLoader,
    GatedThemeProvider,
    NoSSR,
    RootLayout,
    SSRErrorBoundary,
} from "@repo/common/components";
import { PlusDefaultsProvider } from "@repo/common/components/plus-defaults-provider";
import { RootProvider } from "@repo/common/context";
import { OptimizedAuthProvider } from "@repo/common/providers";
import { SubscriptionProvider } from "@repo/common/providers/subscription-provider";
import { TooltipProvider } from "@repo/ui";
import type { Metadata, Viewport } from "next";
import { BetterAuthProvider } from "../components/better-auth-provider";
import { OfflineIndicator } from "../components/offline-indicator";
import { PerformanceOptimizations } from "../components/performance-optimizations";
import { PWAManager } from "../components/pwa-manager";
import { ReactScan } from "../components/react-scan";

// Remove force-dynamic from layout to allow static generation for static pages
// Individual pages that need dynamic rendering will set their own dynamic export

import "@repo/ui/src/styles.css";
import { AccessibilityHead } from "../components/accessibility-improvements";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://vtchat.io.vn"),
    title: "VT",
    description: "Minimal AI chat application.",
    keywords:
        "agent, ai, chatbot, assistant, openai, multimodal, tool-use, llm, llms, function-calling",
    authors: [{ name: "Vinh Nguyen", url: "https://vinhnx.github.io/" }],
    creator: "Vinh Nguyen",
    publisher: "Vinh Nguyen",
    openGraph: {
        title: "VT",
        siteName: "VT",
        description: "Minimal AI chat application.",
        url: "https://vtchat.io.vn",
        type: "website",
        locale: "en_US",
        images: [
            {
                url: "https://vtchat.io.vn/og-image-v2.jpg",
                width: 1200,
                height: 630,
                alt: "VT Preview",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "VT",
        site: "VT",
        creator: "@vinhnx",
        description: "Minimal AI chat application.",
        images: ["https://vtchat.io.vn/twitter-image-v2.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: "https://vtchat.io.vn",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    userScalable: true,
    interactiveWidget: "resizes-content",
};

// Remove duplicate font definitions - already defined above

export default function ParentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <PerformanceOptimizations />
                <AccessibilityHead />
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
                                                    {/* PWA Manager for install prompts and service worker */}
                                                    <PWAManager />
                                                    {/* Offline status indicator */}
                                                    <OfflineIndicator />
                                                    {/* @ts-ignore - Type compatibility issue between React versions */}
                                                    <RootLayout>
                                                        <main className="flex flex-1 flex-col">
                                                            {children}
                                                        </main>
                                                    </RootLayout>
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

import {
    FullPageLoader,
    GatedThemeProvider,
    NoSSR,
    RootLayout,
    SSRErrorBoundary,
} from "@repo/common/components";
import { PlusDefaultsProvider } from "@repo/common/components/plus-defaults-provider";
import { RootProvider } from "@repo/common/context";
import { AccessibilityProvider } from "@repo/common/contexts/accessibility-context";
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
import { defaultMetadata, defaultViewport } from "./page-metadata";

export const metadata: Metadata = defaultMetadata;
export const viewport: Viewport = defaultViewport;

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
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "VT",
                            url: "https://vtchat.io.vn",
                            logo: "https://vtchat.io.vn/og-image-v3.jpg?v=5",
                            description:
                                "Privacy-first AI chat application with advanced AI capabilities",
                            foundingDate: "2025",
                            contactPoint: {
                                "@type": "ContactPoint",
                                email: "hello@vtchat.io.vn",
                                contactType: "customer service",
                            },
                            sameAs: ["https://github.com/vinhnx/vtchat", "https://x.com/vinhnx"],
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            name: "VT",
                            url: "https://vtchat.io.vn",
                            description:
                                "Privacy-first AI chat application with advanced AI capabilities",
                            potentialAction: {
                                "@type": "SearchAction",
                                target: {
                                    "@type": "EntryPoint",
                                    urlTemplate: "https://vtchat.io.vn/chat?q={search_term_string}",
                                },
                                "query-input": "required name=search_term_string",
                            },
                        }),
                    }}
                />
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
                        <AccessibilityProvider>
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
                        </AccessibilityProvider>
                    </TooltipProvider>
                </GatedThemeProvider>
            </body>
        </html>
    );
}

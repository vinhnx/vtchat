'use client';

import { NoSSR, RootLayout, SSRErrorBoundary, ThemeProvider } from '@repo/common/components';
import { RootProvider } from '@repo/common/context';
import { TooltipProvider } from '@repo/ui';
import { BetterAuthProvider } from './better-auth-provider';

export default function DynamicApp({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <TooltipProvider>
                <BetterAuthProvider>
                    <RootProvider>
                        <SSRErrorBoundary>
                            <NoSSR
                                fallback={
                                    <div className="bg-background flex h-[100dvh] w-full items-center justify-center">
                                        <div className="text-muted-foreground text-sm">
                                            Loading...
                                        </div>
                                    </div>
                                }
                            >
                                <RootLayout>{children}</RootLayout>
                            </NoSSR>
                        </SSRErrorBoundary>
                    </RootProvider>
                </BetterAuthProvider>
            </TooltipProvider>
        </ThemeProvider>
    );
}

'use client';

import { RootLayout } from '@repo/common/components';
import { RootProvider } from '@repo/common/context';
import { TooltipProvider } from '@repo/ui';
import { BetterAuthProvider } from './better-auth-provider';

interface DynamicProvidersProps {
    children: React.ReactNode;
}

export default function DynamicProviders({ children }: DynamicProvidersProps) {
    return (
        <TooltipProvider>
            <BetterAuthProvider>
                <RootProvider>
                    <RootLayout>{children}</RootLayout>
                </RootProvider>
            </BetterAuthProvider>
        </TooltipProvider>
    );
}

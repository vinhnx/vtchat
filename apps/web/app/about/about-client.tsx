'use client';

import { Footer, WrapperDisclosure } from '@repo/common/components';
import { useSession } from '@repo/shared/lib/auth-client';
import { TypographyH1 } from '@repo/ui';

export function AboutPageClient() {
    const { data: session, isPending } = useSession();

    return (
        <div className="flex min-h-dvh flex-col">
            <header className="flex items-center justify-between border-b p-3 md:p-4">
                <TypographyH1 className="text-lg font-semibold md:text-xl">VT</TypographyH1>
            </header>
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="max-w-2xl space-y-6 text-center">
                    <TypographyH1 className="text-4xl font-bold">VT</TypographyH1>
                    <p className="break-words px-4 text-base text-gray-600 sm:text-lg dark:text-gray-400">
                        Welcome to VT - Your privacy-focused AI chat platform.
                    </p>
                    <WrapperDisclosure className="mt-4" />
                </div>
            </div>
            {!isPending && <Footer />}
        </div>
    );
}

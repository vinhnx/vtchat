'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { PremiumButton, TypographyH1, Skeleton } from '@repo/ui';
import { WrapperDisclosure, Footer } from '@repo/common/components';
import Link from 'next/link';

export default function Home() {
    const { isPending } = useSession();

    return (
        <div className="flex min-h-dvh flex-col">
            <header className="flex items-center justify-between border-b p-3 md:p-4">
                <TypographyH1 className="text-lg font-semibold md:text-xl">VT</TypographyH1>
                {isPending ? (
                    <Skeleton className="h-8 w-20" />
                ) : session ? (
                    <Link href="/chat">
                        {/* @ts-ignore - Type compatibility issue between React versions */}
                        <PremiumButton variant="premium" size="sm" shimmer>
                            Go to Chat
                        </PremiumButton>
                    </Link>
                ) : (
                    <Link href="/login">
                        {/* @ts-ignore - Type compatibility issue between React versions */}
                        <PremiumButton variant="outline" size="sm">
                            Sign In
                        </PremiumButton>
                    </Link>
                )}
            </header>
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="max-w-2xl space-y-6 text-center">
                    <TypographyH1 className="text-4xl font-bold">VT</TypographyH1>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 break-words px-4">
                        Welcome to VT - Your privacy-focused AI chat platform.
                    </p>
                    <WrapperDisclosure className="mt-4" />
                </div>
            </div>
            {!isPending && <Footer />}
        </div>
    );
}

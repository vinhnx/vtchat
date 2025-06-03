'use client';

import { useAuth, useSignIn } from '@clerk/nextjs';
import { CustomSignIn } from '@repo/common/components';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function OauthSignIn() {
    const { signIn } = useSignIn();
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const redirectUrl = searchParams.get('redirect_url') || '/chat';

    useEffect(() => {
        if (isSignedIn) {
            router.push(redirectUrl);
        }
    }, [isSignedIn, router, redirectUrl]);

    if (!signIn) return null;
    if (!isLoaded) return null;
    if (isSignedIn) return null; // Will redirect via useEffect

    return (
        <div className="bg-secondary/95 fixed inset-0 z-[100] flex h-full w-full flex-col items-center justify-center gap-2 backdrop-blur-sm">
            <CustomSignIn
                onClose={() => {
                    router.push(redirectUrl);
                }}
            />
        </div>
    );
}

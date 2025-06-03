'use client';

import { useAuth } from '@clerk/nextjs';
import { PolarCreditsShop } from '@repo/common/components/polar-credits-shop';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            // Redirect to sign-in page with return URL
            router.push('/sign-in?redirect_url=' + encodeURIComponent('/plus'));
        }
    }, [isLoaded, isSignedIn, router]);

    // Show loading state while checking authentication
    if (!isLoaded) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
                <div className="flex items-center justify-center" style={{ marginTop: '8rem' }}>
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <p className="text-muted-foreground mt-4">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Don't render the component until authentication is confirmed
    if (!isSignedIn) {
        return null;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
            <h1
                className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
                style={{ textAlign: 'center', marginTop: '8rem' }}
            >
                VT has plans that grow with you
            </h1>
            <p
                className="text-muted-foreground text-m"
                style={{ textAlign: 'center', marginBottom: '2rem' }}
            >
                Explore how AI can help you with everyday tasks. Level up productivity and
                creativity with expanded access. Try VT+ today!
            </p>
            <PolarCreditsShop />
        </div>
    );
}

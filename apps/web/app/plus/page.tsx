'use client';

import { LoginDialog } from '@/components/login-dialog';
import { useSession } from '@repo/shared/lib/auth-client';
import { Button } from '@repo/ui';
import { Sparkles, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const isLoaded = true; // Better Auth session is always loaded when available
    const router = useRouter();
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            // Show login dialog instead of redirecting
            setShowLoginDialog(true);
        }
    }, [isLoaded, isSignedIn]);

    // Show loading state while checking authentication
    if (!isLoaded) {
        return (
            <p className="text-muted-foreground flex h-screen items-center justify-center text-sm">
                Loading...
            </p>
        );
    }

    // Don't render the component until authentication is confirmed
    if (!isSignedIn) {
        return (
            <>
                <LoginDialog
                    isOpen={showLoginDialog}
                    onClose={() => setShowLoginDialog(false)}
                    redirectUrl="/plus"
                />
                <div className="container mx-auto px-4 py-16">
                    <div className="flex min-h-[50vh] items-center justify-center">
                        <div className="space-y-4 text-center">
                            <p className="text-muted-foreground">
                                Please sign in to access VT+ plans
                            </p>
                            <Button onClick={() => setShowLoginDialog(true)}>Sign In</Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16">
            {/* Hero Section */}
            <div className="mb-16 space-y-6 text-center">
                <div className="space-y-4">
                    <div className="inline-flex items-center rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1 text-sm dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20">
                        <Sparkles className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Introducing VT+ Plans
                    </div>

                    <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
                        Plans that grow with you
                    </h1>

                    <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                        For everyday productivity.
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button
                        size="lg"
                        onClick={() =>
                            document
                                .getElementById('pricing')
                                ?.scrollIntoView({ behavior: 'smooth' })
                        }
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        <Zap className="mr-2 h-4 w-4" />
                        View Plans
                    </Button>
                    <Button variant="outlined" size="lg" onClick={() => router.push('/chat')}>
                        Try Free Version
                    </Button>
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="space-y-8">
                <div className="space-y-4 text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
                    <p className="text-muted-foreground mx-auto max-w-2xl">Try VT+ today!</p>
                </div>
            </div>
        </div>
    );
}

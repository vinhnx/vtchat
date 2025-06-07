'use client';

import { LoginDialog } from '@/components/login-dialog';
import { CreemCreditsShop } from '@repo/common/components';
import { useSession } from '@repo/shared/lib/auth-client';
import { Button, Spinner } from '@repo/ui';
import { Shield, Sparkles, Users, Zap } from 'lucide-react';
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
            <div className="container mx-auto px-4 py-16">
                <div className="flex min-h-[50vh] items-center justify-center">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </div>
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
                        Supercharge your AI
                    </h1>

                    <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                        Unlock advanced AI capabilities, get unlimited access to premium models, and
                        boost your productivity with VT+. Choose the plan that fits your needs.
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

            {/* Features Grid */}
            <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Advanced Models</h3>
                    <p className="text-muted-foreground">
                        Access to GPT-4, Claude, and other premium AI models for superior responses
                    </p>
                </div>

                <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                        <Zap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Enhanced Features</h3>
                    <p className="text-muted-foreground">
                        Deep research, pro search, advanced chat modes, and dark theme
                    </p>
                </div>

                <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 to-red-600">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Priority Support</h3>
                    <p className="text-muted-foreground">
                        Get faster response times and dedicated customer support
                    </p>
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="space-y-8">
                <div className="space-y-4 text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
                    <p className="text-muted-foreground mx-auto max-w-2xl">
                        Flexible pricing options to match your usage. Start with credits or go
                        unlimited with VT+.
                    </p>
                </div>

                <CreemCreditsShop />
            </div>

            {/* Social Proof */}
            <div className="mt-16 space-y-8 text-center">
                <div className="text-muted-foreground inline-flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>Trusted by thousands of users worldwide</span>
                </div>

                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20">
                        <p className="text-muted-foreground mb-4 italic">
                            "VT+ has transformed how I work with AI. The advanced models and
                            features save me hours every day."
                        </p>
                        <div className="font-medium">Sarah Chen</div>
                        <div className="text-muted-foreground text-sm">Product Manager</div>
                    </div>

                    <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-purple-800 dark:from-purple-950/20 dark:to-pink-950/20">
                        <p className="text-muted-foreground mb-4 italic">
                            "The credit system is perfect for my usage patterns. I only pay for what
                            I need."
                        </p>
                        <div className="font-medium">Alex Rodriguez</div>
                        <div className="text-muted-foreground text-sm">Software Developer</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

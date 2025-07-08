'use client';

import { Footer } from '@repo/common/components';
import { useGlobalSubscriptionStatus } from '@repo/common/providers/subscription-provider';
import { useSession } from '@repo/shared/lib/auth-client';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import {
    Badge,
    PremiumButton,
    PremiumCard,
    PremiumCardContent,
    PremiumCardHeader,
    PremiumCardTitle,
} from '@repo/ui';
import { Database, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RAGChatbot } from '../../components/rag-chatbot';
import { PRICING_CONFIG } from '../../lib/config/pricing';

export default function RAGPage() {
    const { data: session, isPending: isSessionLoading } = useSession();
    const {
        subscriptionStatus,
        isPlusSubscriber,
        isLoading: isSubscriptionLoading,
    } = useGlobalSubscriptionStatus();
    const router = useRouter();

    const isSignedIn = !!session?.user;
    const isLoaded = !isSessionLoading;
    const isLoading = isSessionLoading || isSubscriptionLoading;
    const hasAccess =
        isPlusSubscriber && subscriptionStatus?.status === SubscriptionStatusEnum.ACTIVE;

    // Handle redirect to login if not signed in
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/login?redirect_url=/rag');
        }
    }, [isLoaded, isSignedIn, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Return null while redirecting to login
    if (isLoaded && !isSignedIn) {
        return null;
    }

    // Show upgrade prompt if no access
    if (isLoaded && isSignedIn && !hasAccess) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex min-h-[60vh] items-center justify-center">
                    <PremiumCard className="w-full max-w-md text-center" variant="elevated">
                        <PremiumCardHeader>
                            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                <Lock className="text-primary h-8 w-8" />
                            </div>
                            <PremiumCardTitle className="flex items-center justify-center gap-2">
                                <Database className="h-5 w-5" />
                                Personal AI Assistant with Memory
                            </PremiumCardTitle>
                        </PremiumCardHeader>
                        <PremiumCardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                This feature is available exclusively for{' '}
                                {PRICING_CONFIG.product.name} subscribers.
                            </p>
                            <div className="bg-muted rounded-lg p-4">
                                <h4 className="mb-2 text-sm font-medium">What you'll get:</h4>
                                <ul className="text-muted-foreground space-y-1 text-sm">
                                    <li>• Build your personal knowledge base</li>
                                    <li>• Store and organize information</li>
                                    <li>• Query your data with AI</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                {/* Free Trial & Cancel Anytime */}
                                <div className="flex items-center justify-center gap-3 text-xs">
                                    <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1">
                                        <Sparkles className="h-3 w-3 text-green-400" />
                                        <span className="font-medium text-green-400">
                                            Free trial
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1">
                                        <span className="h-3 w-3 text-blue-400">✓</span>
                                        <span className="font-medium text-blue-400">
                                            Cancel anytime
                                        </span>
                                    </div>
                                </div>

                                <PremiumButton
                                    className="w-full"
                                    onClick={() => router.push('/plus')}
                                    shimmer
                                    size="lg"
                                    variant="premium"
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Upgrade to {PRICING_CONFIG.product.name}
                                </PremiumButton>
                                <PremiumButton
                                    className="w-full"
                                    onClick={() => router.push('/')}
                                    variant="outline"
                                >
                                    Continue with Free Chat
                                </PremiumButton>
                            </div>
                        </PremiumCardContent>
                    </PremiumCard>
                </div>
            </div>
        );
    }

    // Show RAG chatbot for plus subscribers
    return (
        <div className="flex h-dvh flex-col overflow-hidden">
            <div className="container mx-auto flex min-h-0 flex-1 flex-col px-2 py-4 md:px-4 md:py-8">
                <div className="mb-4 flex-shrink-0 md:mb-6">
                    <h1 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
                        Personal AI Assistant with Memory
                        <Badge
                            className="vt-plus-glass border-[#D99A4E]/30 text-[#D99A4E] shadow-lg"
                            variant="secondary"
                        >
                            VT+
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm">
                        Build and query your personal knowledge base with AI
                    </p>
                </div>


                <div className="min-h-0 flex-1">
                    <RAGChatbot />
                </div>
            </div>

            {/* Footer */}
            <footer className="border-border/50 bg-background border-t">
                <div className="mx-auto max-w-7xl">
                    <Footer />
                </div>
            </footer>
        </div>
    );
}

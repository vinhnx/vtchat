'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { useGlobalSubscriptionStatus } from '@repo/common/providers/subscription-provider';
import { RAGChatbot } from '../../components/rag-chatbot';
import { Footer } from '@repo/common/components';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumButton, Badge } from '@repo/ui';
import { Database, Lock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PRICING_CONFIG } from '../../lib/config/pricing';
import { useEffect } from 'react';

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
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
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
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Lock className="h-8 w-8 text-primary" />
                            </div>
                            <PremiumCardTitle className="flex items-center justify-center gap-2">
                                <Database className="h-5 w-5" />
                                Personal AI Assistant with Memory
                            </PremiumCardTitle>
                        </PremiumCardHeader>
                        <PremiumCardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                This feature is available exclusively for {PRICING_CONFIG.product.name} subscribers.
                            </p>
                            <div className="rounded-lg bg-muted p-4">
                                <h4 className="font-medium text-sm mb-2">What you'll get:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Build your personal knowledge base</li>
                                    <li>• Store and organize information</li>
                                    <li>• Query your data with AI</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <PremiumButton 
                                    onClick={() => router.push('/plus')}
                                    className="w-full"
                                    size="lg"
                                    variant="premium"
                                    shimmer
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Upgrade to {PRICING_CONFIG.product.name}
                                </PremiumButton>
                                <PremiumButton 
                                    onClick={() => router.push('/chat')}
                                    variant="outline"
                                    className="w-full"
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
        <div className="h-dvh flex flex-col overflow-hidden">
            <div className="container mx-auto px-2 py-4 flex-1 flex flex-col min-h-0 md:px-4 md:py-8">
                <div className="mb-4 flex-shrink-0 md:mb-6">
                    <h1 className="text-xl font-bold flex items-center gap-2 md:text-2xl">
                        Personal AI Assistant with Memory
                        <Badge variant="secondary" className="vt-plus-glass text-[#D99A4E] border-[#D99A4E]/30 shadow-lg">VT+</Badge>
                    </h1>
                    <p className="text-xs text-muted-foreground md:text-sm">
                        Build and query your personal knowledge base with AI
                    </p>
                </div>
                <div className="flex-1 min-h-0">
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

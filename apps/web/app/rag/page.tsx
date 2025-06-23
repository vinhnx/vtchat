'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { useGlobalSubscriptionStatus } from '@repo/common/providers/subscription-provider';
import { RAGChatbot } from '../../components/rag-chatbot';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@repo/ui';
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
                    <Card className="w-full max-w-md text-center">
                        <CardHeader>
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Lock className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="flex items-center justify-center gap-2">
                                <Database className="h-5 w-5" />
                                RAG Knowledge Chat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                This feature is available exclusively for {PRICING_CONFIG.product.name} subscribers.
                            </p>
                            <div className="rounded-lg bg-muted p-4">
                                <h4 className="font-medium text-sm mb-2">What you'll get:</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Build your personal knowledge base</li>
                                    <li>• Store and organize information</li>
                                    <li>• Query your data with AI</li>
                                    <li>• Intelligent document search</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <Button 
                                    onClick={() => router.push('/plus')}
                                    className="w-full"
                                    size="lg"
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Upgrade to {PRICING_CONFIG.product.name}
                                </Button>
                                <Button 
                                    onClick={() => router.push('/chat')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Continue with Free Chat
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Show RAG chatbot for plus subscribers
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <div className="container mx-auto px-4 py-8 flex-1 flex flex-col min-h-0">
                <div className="mb-6 flex-shrink-0">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        RAG Knowledge Chat
                        <Badge variant="secondary">VT+</Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Build and query your personal knowledge base with AI
                    </p>
                </div>
                <div className="flex-1 min-h-0">
                    <RAGChatbot />
                </div>
            </div>
        </div>
    );
}

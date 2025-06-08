'use client';

import { useCreemSubscription, useSubscription } from '@repo/common/hooks';
import { Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatedBadge } from '../../components/animated-badge';
import { ButtonAnimatedGradient } from '../../components/button-animated-gradient';
import { ButtonShadowGradient } from '../../components/button-shadow-gradient';
import { CardSpotlightPricing } from '../../components/card-spotlight-pricing';
import { FeaturesAccordion } from '../../components/features-accordion';
import { LoginDialog } from '../../components/login-dialog';
import { ShineText } from '../../components/shine-text';
import {
    TypographyH2,
    TypographyLarge,
    TypographyMuted,
    TypographyP,
} from '../../components/ui/typography';
import { useSession } from '../../lib/auth-client';
import { PRICING_CONFIG } from '../../lib/config/pricing';

export default function PlusPage() {
    const { data: session, isPending: isSessionLoading } = useSession();
    const { subscriptionStatus, isLoading: isSubscriptionLoading, isVTPlus } = useSubscription();
    const {
        startVtPlusSubscription,
        openCustomerPortal,
        isLoading: isPaymentLoading,
    } = useCreemSubscription();
    const router = useRouter();
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const isSignedIn = !!session?.user;
    const isLoaded = !isSessionLoading;
    const isLoading = isSessionLoading || isSubscriptionLoading;
    const isCurrentlySubscribed = isVTPlus && subscriptionStatus.isActive;

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            // Show login dialog instead of redirecting
            setShowLoginDialog(true);
        }
    }, [isLoaded, isSignedIn]);

    const handleSubscribe = async () => {
        if (!isSignedIn) {
            setShowLoginDialog(true);
            return;
        }

        if (isCurrentlySubscribed) {
            // If already subscribed, open customer portal to manage subscription
            await openCustomerPortal();
        } else {
            // Start new subscription
            await startVtPlusSubscription();
        }
    };

    const handleTryFree = () => {
        if (!isSignedIn) {
            setShowLoginDialog(true);
        } else {
            router.push('/chat');
        }
    };

    const scrollToPricing = () => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Dynamic button text based on user state
    const getSubscribeButtonText = () => {
        if (isLoading) return 'Loading...';
        if (!isSignedIn) return `Subscribe to ${PRICING_CONFIG.product.name}`;
        if (isCurrentlySubscribed) return 'Manage Subscription';
        return `Upgrade to ${PRICING_CONFIG.product.name}`;
    };

    const getFreeButtonText = () => {
        if (isLoading) return 'Loading...';
        if (!isSignedIn) return 'Sign Up Free';
        if (isCurrentlySubscribed) return 'Continue to Chat';
        return 'Try Free';
    };

    const getCTAButtonText = () => {
        if (isLoading) return 'Loading...';
        if (!isSignedIn) return `Start Your ${PRICING_CONFIG.product.name} Journey`;
        if (isCurrentlySubscribed) return `Continue with ${PRICING_CONFIG.product.name}`;
        return `Upgrade to ${PRICING_CONFIG.product.name}`;
    };

    return (
        <div className="relative min-h-screen w-full bg-slate-950">
            {/* Linear Gradient Background */}
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>

            <div className="container relative mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="mb-8 space-y-2 text-center">
                    <div className="space-y-3">
                        <AnimatedBadge>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Introducing {PRICING_CONFIG.product.name} Plans
                        </AnimatedBadge>

                        <TypographyH2 className="border-none pb-0 text-2xl text-white sm:text-3xl">
                            <ShineText className="text-2xl sm:text-3xl">
                                Plans that grow with you
                            </ShineText>
                        </TypographyH2>

                        <h2 className="mx-auto max-w-2xl scroll-m-20 pb-2 text-3xl font-semibold tracking-tight text-gray-400 first:mt-0">
                            {PRICING_CONFIG.product.description}. Unlock the full potential of
                            AI-powered assistance.
                        </h2>
                    </div>
                </div>

                {/* Pricing Section */}
                <div id="pricing" className="relative isolate px-6 py-8 sm:py-10 lg:px-8">
                    <div
                        className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
                        aria-hidden="true"
                    >
                        <div
                            className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#BFB38F] to-[#D4C5A0] opacity-30"
                            style={{
                                clipPath:
                                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                            }}
                        ></div>
                    </div>

                    <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
                        {/* Free Plan Card */}
                        <CardSpotlightPricing className="rounded-3xl rounded-t-3xl bg-white p-8 ring-1 ring-gray-900/10 sm:mx-8 sm:rounded-b-none sm:p-10 lg:mx-0 lg:rounded-bl-3xl lg:rounded-tr-none">
                            <div>
                                <h3
                                    id="tier-free"
                                    className="text-base/7 font-semibold text-[#BFB38F]"
                                >
                                    Free
                                </h3>
                                <p className="mt-4 flex items-baseline gap-x-2">
                                    <span className="text-5xl font-semibold tracking-tight text-gray-900">
                                        ${PRICING_CONFIG.pricing.free.price}
                                    </span>
                                    <span className="text-base text-gray-500">
                                        /{PRICING_CONFIG.pricing.free.interval}
                                    </span>
                                </p>
                                <p className="mt-6 text-base/7 text-gray-600">
                                    Perfect for getting started with our product.
                                </p>
                                <ul
                                    role="list"
                                    className="mt-8 space-y-3 text-sm/6 text-gray-600 sm:mt-10"
                                >
                                    {PRICING_CONFIG.pricing.free.features.map((feature, index) => (
                                        <li key={index} className="flex gap-x-3">
                                            <Check className="h-6 w-5 flex-none text-[#BFB38F]" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8 sm:mt-10">
                                    <ButtonShadowGradient
                                        onClick={handleTryFree}
                                        className="w-full"
                                    >
                                        Try Free
                                    </ButtonShadowGradient>
                                </div>
                            </div>
                        </CardSpotlightPricing>

                        {/* VT+ Plan Card */}
                        <CardSpotlightPricing className="rounded-3xl bg-gray-900 p-8 shadow-2xl ring-1 ring-gray-900/10 sm:p-10">
                            <div>
                                <h3
                                    id="tier-vt-plus"
                                    className="text-base/7 font-semibold text-[#BFB38F]"
                                >
                                    {PRICING_CONFIG.product.name}
                                </h3>
                                <p className="mt-4 flex items-baseline gap-x-2">
                                    <span className="text-5xl font-semibold tracking-tight text-white">
                                        ${PRICING_CONFIG.pricing.plus.price}
                                    </span>
                                    <span className="text-base text-gray-400">
                                        /{PRICING_CONFIG.pricing.plus.interval}
                                    </span>
                                </p>
                                <p className="mt-6 text-base/7 text-gray-300">
                                    {PRICING_CONFIG.product.description} and enhanced AI
                                    capabilities.
                                </p>
                                <ul
                                    role="list"
                                    className="mt-8 space-y-3 text-sm/6 text-gray-300 sm:mt-10"
                                >
                                    {PRICING_CONFIG.pricing.plus.features.map((feature, index) => (
                                        <li key={index} className="flex gap-x-3">
                                            <Check className="h-6 w-5 flex-none text-[#BFB38F]" />
                                            {typeof feature === 'string'
                                                ? feature
                                                : `${feature.name}: ${feature.description}`}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8 sm:mt-10">
                                    <ButtonAnimatedGradient
                                        onClick={handleSubscribe}
                                        className="w-full"
                                    >
                                        Subscribe to {PRICING_CONFIG.product.name}
                                    </ButtonAnimatedGradient>
                                </div>
                            </div>
                        </CardSpotlightPricing>
                    </div>
                </div>

                {/* Features Section - Moved below pricing table */}
                <div className="mb-16 mt-20">
                    <div className="mb-12 text-center">
                        <TypographyLarge className="mb-4 text-white">
                            Powerful Features
                        </TypographyLarge>
                        <TypographyMuted className="mx-auto max-w-2xl text-gray-400">
                            Discover what makes {PRICING_CONFIG.product.name} the perfect choice for
                            your productivity needs
                        </TypographyMuted>
                    </div>
                    <FeaturesAccordion />
                </div>

                {/* CTA Section */}
                <div className="mt-16 space-y-4 text-center">
                    <TypographyLarge className="text-white">Ready to get started?</TypographyLarge>
                    <TypographyP className="mx-auto mt-0 max-w-2xl text-base text-gray-400">
                        Join thousands of users who are already boosting their productivity with{' '}
                        {PRICING_CONFIG.product.name}
                    </TypographyP>
                    <div className="mx-auto max-w-md pt-4">
                        <ButtonAnimatedGradient onClick={handleSubscribe} className="w-full">
                            Start Your {PRICING_CONFIG.product.name} Journey
                        </ButtonAnimatedGradient>
                    </div>
                </div>
            </div>

            {/* Login Dialog */}
            <LoginDialog
                open={showLoginDialog}
                onOpenChange={setShowLoginDialog}
                onSuccess={() => setShowLoginDialog(false)}
            />
        </div>
    );
}

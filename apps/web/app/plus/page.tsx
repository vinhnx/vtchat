'use client';

import { UserTierBadge } from '@repo/common/components';
import { useCreemSubscription } from '@repo/common/hooks';
import { useGlobalSubscriptionStatus } from '@repo/common/providers/subscription-provider';
import { BUTTON_TEXT } from '@repo/shared/constants';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status'; // Added import
import { Check, CheckCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AnimatedBadge } from '../../components/animated-badge';
import { ButtonAnimatedGradient } from '../../components/button-animated-gradient';
import { ButtonShadowGradient } from '../../components/button-shadow-gradient';
import { CardSpotlightPricing } from '../../components/card-spotlight-pricing';
import { FeaturesAccordion } from '../../components/features-accordion';
import { ShineText } from '../../components/shine-text';
// import { TypographyLarge, TypographyMuted, TypographyP } from '../../components/ui/typography';
import { useSession } from '../../lib/auth-client';
import { PRICING_CONFIG } from '../../lib/config/pricing';

export default function PlusPage() {
    const { data: session, isPending: isSessionLoading } = useSession();
    const {
        subscriptionStatus,
        isPlusSubscriber,
        isLoading: isSubscriptionLoading,
        refreshSubscriptionStatus,
    } = useGlobalSubscriptionStatus();
    const {
        startVtPlusSubscription,
        openCustomerPortal,
        isLoading: isPaymentLoading,
        isPortalLoading,
    } = useCreemSubscription();
    const router = useRouter();

    const isSignedIn = !!session?.user;
    const isLoaded = !isSessionLoading;
    const isLoading = isSessionLoading || isSubscriptionLoading;
    const isCurrentlySubscribed =
        isPlusSubscriber && subscriptionStatus?.status === SubscriptionStatusEnum.ACTIVE;
    const isFreeTier =
        isLoaded &&
        (!isPlusSubscriber || subscriptionStatus?.status !== SubscriptionStatusEnum.ACTIVE);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            // Redirect to login page instead of showing dialog
            router.push('/login?redirect_url=/plus');
        }
    }, [isLoaded, isSignedIn, router]);

    // Refresh subscription status when page loads (useful after payment completion)
    useEffect(() => {
        if (isSignedIn && !isSubscriptionLoading) {
            refreshSubscriptionStatus();
        }
    }, [isSignedIn, refreshSubscriptionStatus, isSubscriptionLoading]);

    const handleSubscribe = async () => {
        if (!isSignedIn) {
            router.push('/login?redirect_url=/plus');
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
            router.push('/login?redirect_url=/chat');
        } else {
            router.push('/chat');
        }
    };

    const scrollToPricing = () => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Dynamic button text based on user state
    const getSubscribeButtonText = () => {
        if (isLoading || isPortalLoading) return BUTTON_TEXT.LOADING;
        if (!isSignedIn) return `Subscribe to ${PRICING_CONFIG.product.name}`;
        if (isCurrentlySubscribed) {
            return (
                <>
                    {isPortalLoading ? BUTTON_TEXT.LOADING : BUTTON_TEXT.MANAGE_SUBSCRIPTION}
                    <UserTierBadge className="ml-2" />
                </>
            );
        }
        return `Upgrade to ${PRICING_CONFIG.product.name}`;
    };

    const getFreeButtonText = () => {
        if (isLoading) return BUTTON_TEXT.LOADING;
        if (!isSignedIn) return 'Sign Up Free';
        // If signed in:
        if (isCurrentlySubscribed) return 'Continue to Chat'; // User is VT+
        return 'Continue'; // User is signed in and on Free tier
    };

    const getCTAButtonText = () => {
        if (isLoading || isPortalLoading) return BUTTON_TEXT.LOADING;
        if (!isSignedIn) return `Start Your ${PRICING_CONFIG.product.name} Journey`;
        if (isCurrentlySubscribed) {
            return (
                <>
                    {isPortalLoading ? BUTTON_TEXT.LOADING : BUTTON_TEXT.MANAGE_SUBSCRIPTION}
                    {!isPortalLoading && <UserTierBadge className="ml-2" />}
                </>
            );
        }
        return `Upgrade to ${PRICING_CONFIG.product.name}`;
    };

    return (
        <div className="relative min-h-screen w-full">
            {/* Fixed Grid Background */}
            <div className="fixed inset-0 h-full w-full bg-slate-950">
                <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            </div>
            <div className="container relative z-10 mx-auto px-4 py-8 pt-16">
                {/* Hero Section */}
                <div className="mb-8 space-y-3 pt-8 text-center">
                    <div className="space-y-3">
                        <AnimatedBadge>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {PRICING_CONFIG.product.name}
                        </AnimatedBadge>

                        <div>
                            <ShineText className="text-2xl sm:text-3xl">
                                Plans that grow with you
                            </ShineText>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div id="pricing" className="relative px-6 py-4 sm:py-6 lg:px-8">
                    <div className="mx-auto grid max-w-lg grid-cols-1 items-center gap-3 lg:max-w-4xl lg:grid-cols-2">
                        {/* Free Plan Card */}
                        <CardSpotlightPricing
                            className={`rounded-3xl rounded-t-3xl bg-white p-8 ring-1 sm:mx-8 sm:rounded-b-none sm:p-10 lg:mx-0 lg:rounded-bl-3xl lg:rounded-tr-none ${
                                isFreeTier ? 'ring-2 ring-[#BFB38F]' : 'ring-gray-900/10'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3
                                        id="tier-free"
                                        className="text-base/7 font-semibold text-[#BFB38F]"
                                    >
                                        Free
                                    </h3>
                                    {isFreeTier && (
                                        <div className="flex items-center gap-2 rounded-full bg-[#BFB38F]/10 px-3 py-1">
                                            <CheckCircle className="h-4 w-4 text-[#BFB38F]" />
                                            <span className="text-sm font-medium text-[#BFB38F]">
                                                Current Plan
                                            </span>
                                        </div>
                                    )}
                                </div>
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
                                        {getFreeButtonText()}
                                    </ButtonShadowGradient>
                                </div>
                            </div>
                        </CardSpotlightPricing>

                        {/* VT+ Plan Card */}
                        <CardSpotlightPricing
                            className={`rounded-3xl bg-gray-900 p-8 shadow-2xl ring-1 sm:p-10 ${
                                isCurrentlySubscribed ? 'ring-2 ring-[#BFB38F]' : 'ring-gray-900/10'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3
                                        id="tier-vt-plus"
                                        className="text-base/7 font-semibold text-[#BFB38F]"
                                    >
                                        {PRICING_CONFIG.product.name}
                                    </h3>
                                    {isCurrentlySubscribed && (
                                        <div className="flex items-center gap-2 rounded-full bg-[#BFB38F]/20 px-3 py-1">
                                            <CheckCircle className="h-4 w-4 text-[#BFB38F]" />
                                            <span className="text-sm font-medium text-[#BFB38F]">
                                                Current Plan
                                            </span>
                                        </div>
                                    )}
                                </div>
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
                                        onClick={() => {
                                            if (!(isPortalLoading || isPaymentLoading)) {
                                                handleSubscribe();
                                            }
                                        }}
                                        className="flex w-full items-center justify-center"
                                    >
                                        {getSubscribeButtonText()}
                                    </ButtonAnimatedGradient>
                                </div>
                            </div>
                        </CardSpotlightPricing>
                    </div>
                </div>

                {/* Features Section - Moved below pricing table */}
                <div className="mb-8 mt-8">
                    <div className="mb-6 text-center">
                        <h2 className="mb-4 text-white text-lg font-semibold">
                            Powerful Features
                        </h2>
                        <p className="mx-auto max-w-2xl text-white text-sm text-muted-foreground">
                            Discover what makes {PRICING_CONFIG.product.name} the perfect choice for
                            your productivity needs
                        </p>
                    </div>
                    <FeaturesAccordion />
                </div>

                {/* CTA Section */}
                <div className="mt-8 space-y-4 text-center">
                    <h2 className="text-white text-lg font-semibold">Ready to get started?</h2>
                    <div className="mx-auto max-w-md pt-4">
                        <ButtonAnimatedGradient
                            onClick={() => {
                                if (!(isPortalLoading || isPaymentLoading)) {
                                    handleSubscribe();
                                }
                            }}
                            className="flex w-full items-center justify-center"
                        >
                            {getCTAButtonText()}
                        </ButtonAnimatedGradient>
                    </div>
                </div>
            </div>
        </div>
    );
}

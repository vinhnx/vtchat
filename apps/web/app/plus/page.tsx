'use client';

import { Footer, ShineText, UserTierBadge } from '@repo/common/components';
import { useVemetricSubscriptionTracking } from '@repo/common/components/vemetric-subscription-tracker';
import { useCreemSubscription, useVemetric } from '@repo/common/hooks';
import { useGlobalSubscriptionStatus } from '@repo/common/providers/subscription-provider';
import { ANALYTICS_EVENTS } from '@repo/common/utils/analytics';
import { BUTTON_TEXT, CURRENCIES, PAYMENT_EVENT_TYPES, PAYMENT_SERVICES, SETTINGS_ACTIONS } from '@repo/shared/constants';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status'; // Added import
import { TypographyH2, TypographyH3 } from '@repo/ui';
import { Check, CheckCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AnimatedBadge } from '../../components/animated-badge';
import { ButtonAnimatedGradient } from '../../components/button-animated-gradient';
import { ButtonShadowGradient } from '../../components/button-shadow-gradient';
import { CardSpotlightPricing } from '../../components/card-spotlight-pricing';
import { FeaturesAccordion } from '../../components/features-accordion';
// import { TypographyLarge, TypographyMuted, TypographyP } from '../../components/ui/typography';
import { useSession } from '@repo/shared/lib/auth-client';
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

    // Analytics tracking
    const { trackEvent } = useVemetric();
    const { trackUpgradeInitiated, trackPaymentEvent } = useVemetricSubscriptionTracking();

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

    // Track page access
    useEffect(() => {
        if (isSignedIn) {
            trackEvent(ANALYTICS_EVENTS.PAGE_VIEWED, {
                page: 'plus_page',
                userTier: isCurrentlySubscribed ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE,
                context: 'subscription_management',
            }).catch(error => {
                console.error('Failed to track page view:', error);
            });
        }
    }, [isSignedIn, isCurrentlySubscribed, trackEvent]);

    const handleSubscribe = async () => {
        if (!isSignedIn) {
            router.push('/login?redirect_url=/plus');
            return;
        }

        if (isCurrentlySubscribed) {
            // If already subscribed, open customer portal to manage subscription
            try {
                await trackEvent(ANALYTICS_EVENTS.SETTINGS_CHANGED, {
                    action: SETTINGS_ACTIONS.MANAGE_SUBSCRIPTION_ACCESSED,
                    context: 'plus_page',
                });
                await openCustomerPortal();
            } catch (error) {
                console.error('Analytics tracking failed:', error);
                await openCustomerPortal(); // Continue even if tracking fails
            }
        } else {
            // Start new subscription
            try {
                // Track upgrade initiation
                await trackUpgradeInitiated('plus_page');

                // Track payment start
                await trackPaymentEvent({
                    event: PAYMENT_EVENT_TYPES.PAYMENT_STARTED,
                    tier: PlanSlug.VT_PLUS,
                    amount: PRICING_CONFIG.pricing.plus.price,
                    currency: CURRENCIES.USD,
                    paymentMethod: PAYMENT_SERVICES.CREEM,
                });

                await startVtPlusSubscription();
            } catch (error) {
                console.error('Analytics tracking failed:', error);
                await startVtPlusSubscription(); // Continue even if tracking fails
            }
        }
    };

    const handleTryFree = () => {
        if (!isSignedIn) {
            router.push('/login?redirect_url=/chat');
        } else {
            router.push('/chat');
        }
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
        <div className="relative min-h-dvh w-full">
            <div className="container relative z-10 mx-auto px-2 py-4 pt-8 md:px-4 md:py-8 md:pt-16">
                {/* Hero Section */}
                <div className="mb-4 space-y-3 pt-4 text-center md:mb-8 md:pt-8">
                    <div className="space-y-2 md:space-y-3">
                        <AnimatedBadge>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {PRICING_CONFIG.product.name}
                        </AnimatedBadge>

                        <div>
                            <ShineText className="text-3xl font-bold leading-tight tracking-tight md:text-5xl md:leading-loose lg:text-6xl">
                                Choose your perfect plan
                            </ShineText>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div id="pricing" className="relative px-2 py-4 md:px-6 md:py-6 lg:px-8">
                    <div className="mx-auto grid max-w-lg grid-cols-1 items-center gap-0 lg:max-w-4xl lg:grid-cols-2">
                        {/* Free Plan Card */}
                        <CardSpotlightPricing
                            className={`rounded-3xl rounded-t-3xl bg-white p-4 ring-1 sm:mx-8 sm:rounded-b-none sm:p-8 md:p-10 lg:mx-0 lg:rounded-bl-3xl lg:rounded-tr-none ${
                                isFreeTier ? 'ring-2 ring-[#BFB38F]' : 'ring-gray-900/10'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <TypographyH3
                                        id="tier-free"
                                        className="text-lg font-bold text-[#BFB38F]"
                                    >
                                        Free
                                    </TypographyH3>
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
                                            {typeof feature === 'string' ? feature : feature.name}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8 sm:mt-10">
                                    <ButtonShadowGradient
                                        onClick={handleTryFree}
                                        className="w-full"
                                        data-vmtrc="FreePlanSelected"
                                        data-vmtrc-plan="VT_BASE"
                                        data-vmtrc-context="pricing_page"
                                    >
                                        {getFreeButtonText()}
                                    </ButtonShadowGradient>
                                </div>
                            </div>
                        </CardSpotlightPricing>

                        {/* VT+ Plan Card */}
                        <div className="relative inline-block overflow-hidden rounded-3xl p-[1px]">
                            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#BFB38F_0%,#262626_50%,#BFB38F_100%)]" />
                            <CardSpotlightPricing
                                className={`relative rounded-3xl bg-gray-900 p-8 shadow-2xl ring-1 sm:p-10 ${
                                    isCurrentlySubscribed
                                        ? 'ring-2 ring-[#BFB38F]'
                                        : 'ring-gray-900/10'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <TypographyH3
                                            id="tier-vt-plus"
                                            className="text-lg font-bold text-[#BFB38F]"
                                        >
                                            {PRICING_CONFIG.product.name}
                                        </TypographyH3>
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
                                        {PRICING_CONFIG.product.description.split(':')[0]}
                                    </p>
                                    <ul
                                        role="list"
                                        className="mt-8 space-y-3 text-sm/6 text-gray-300 sm:mt-10"
                                    >
                                        {PRICING_CONFIG.pricing.plus.features.map(
                                            (feature, index) => (
                                                <li key={index} className="flex gap-x-3">
                                                    <Check className="h-6 w-5 flex-none text-[#BFB38F]" />
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {typeof feature === 'string'
                                                                ? feature
                                                                : feature.name}
                                                        </span>
                                                    </div>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                    <div className="mt-8 sm:mt-10">
                                        <ButtonAnimatedGradient
                                            onClick={() => {
                                                if (!(isPortalLoading || isPaymentLoading)) {
                                                    handleSubscribe();
                                                }
                                            }}
                                            className="flex w-full items-center justify-center"
                                            data-vmtrc="PremiumPlanSelected"
                                            data-vmtrc-plan="VT_PLUS"
                                            data-vmtrc-context="pricing_page"
                                            data-vmtrc-price="10"
                                        >
                                            {getSubscribeButtonText()}
                                        </ButtonAnimatedGradient>
                                    </div>

                                    {/* Terms and Privacy Links */}
                                    <div className="mt-4 text-center text-sm text-gray-400">
                                        <span className="text-gray-500">Please review our</span>{' '}
                                        <a
                                            href="/terms"
                                            className="underline transition-colors hover:text-[#BFB38F]"
                                        >
                                            Terms of Service
                                        </a>{' '}
                                        <span>and</span>{' '}
                                        <a
                                            href="/privacy"
                                            className="underline transition-colors hover:text-[#BFB38F]"
                                        >
                                            Privacy Policy
                                        </a>{' '}
                                        <span className="text-gray-500">before subscribing</span>
                                    </div>
                                </div>
                            </CardSpotlightPricing>
                        </div>
                    </div>
                </div>

                {/* Features Section - Moved below pricing table */}
                <div className="mb-8 mt-8">
                    <div className="mb-6 text-center">
                        <ShineText className="text-4xl font-bold leading-relaxed tracking-tight sm:text-4xl">
                            Powerful Features
                        </ShineText>
                        <p className="leading-7 [&:not(:first-child)]:mt-6">
                            Discover what makes {PRICING_CONFIG.product.name} the perfect choice for
                            your productivity needs
                        </p>
                    </div>
                    <FeaturesAccordion />
                </div>

                {/* CTA Section */}
                <div className="mt-8 space-y-4 text-center">
                    <TypographyH2 className="text text-lg font-semibold">
                        Ready to get started?
                    </TypographyH2>
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

                {/* Contact Section */}
                <div className="mb-8 mt-8 text-center">
                    <p className="text-base text-gray-600">
                        Have questions? Get in touch:{' '}
                        <a
                            href="mailto:hello@vtchat.io.vn"
                            className="font-medium text-[#BFB38F] transition-colors hover:text-[#BFB38F]/80"
                        >
                            hello@vtchat.io.vn
                        </a>
                    </p>
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

'use client';

import { useCreemSubscription, useCurrentPlan, useVtPlusAccess } from '@repo/common/hooks';
import { getEnabledVTPlusFeatures } from '@repo/shared/config/vt-plus-features';
import { BUTTON_TEXT, TOOLTIP_TEXT } from '@repo/shared/constants';
import { PLANS, PlanSlug } from '@repo/shared/types/subscription';
import { Button, Card, HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui';
import {
    IconCheck,
    IconCreditCard,
    IconExternalLink,
    IconInfoCircle,
    IconSparkles,
    IconStar,
} from '@tabler/icons-react';
import { UserTierBadge } from './user-tier-badge';

interface UsageCreditsSettingsProps {
    onClose?: () => void;
}

export function UsageCreditsSettings({ onClose }: UsageCreditsSettingsProps) {
    const isVtPlus = useVtPlusAccess();
    const { planSlug, isLoaded } = useCurrentPlan();
    const { openCustomerPortal, isPortalLoading } = useCreemSubscription();

    const currentPlan = planSlug && PLANS[planSlug] ? PLANS[planSlug] : PLANS[PlanSlug.VT_BASE];
    const vtPlusFeatures = getEnabledVTPlusFeatures();

    const handleManageSubscription = async () => {
        try {
            await openCustomerPortal();
        } catch (error) {
            console.error('Failed to open subscription portal:', error);
        }
    };

    const handleUpgradeToPlus = () => {
        // Close settings modal and navigate to pricing page
        onClose?.();
        window.location.href = '/plus';
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Current Plan Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">Current Plan</h3>
                    <HoverCard>
                        <HoverCardTrigger>
                            <IconInfoCircle size={16} className="text-muted-foreground hover:text-foreground transition-colors" />
                        </HoverCardTrigger>
                        <HoverCardContent>
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Plan Information</h4>
                                <p className="text-xs text-muted-foreground">
                                    Your subscription tier determines access to features and AI models.
                                </p>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`rounded-full p-3 ${isVtPlus ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <IconStar
                                    size={24}
                                    className={isVtPlus ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-semibold text-foreground">
                                        {currentPlan.name}
                                    </span>
                                    <UserTierBadge />
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {currentPlan.description}
                                </p>
                            </div>
                        </div>
                        {isLoaded && (
                            <div className="text-right">
                                {isVtPlus ? (
                                    <Button
                                        variant="outlined"
                                        size="sm"
                                        onClick={handleManageSubscription}
                                        disabled={isPortalLoading}
                                        className="gap-2 hover:bg-accent transition-colors"
                                        tooltip={TOOLTIP_TEXT.MANAGE_SUBSCRIPTION_NEW_TAB}
                                    >
                                        <IconCreditCard size={16} />
                                        {isPortalLoading
                                            ? BUTTON_TEXT.LOADING
                                            : BUTTON_TEXT.MANAGE_SUBSCRIPTION}
                                        <IconExternalLink size={14} />
                                    </Button>
                                ) : (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleUpgradeToPlus}
                                        className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                                    >
                                        <IconSparkles size={16} />
                                        Upgrade to Plus
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">Plan Features</h3>
                    <HoverCard>
                        <HoverCardTrigger>
                            <IconInfoCircle size={16} className="text-muted-foreground hover:text-foreground transition-colors" />
                        </HoverCardTrigger>
                        <HoverCardContent>
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Feature Access</h4>
                                <p className="text-xs text-muted-foreground">
                                    Each plan includes different features and capabilities.
                                </p>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>

                <div className="grid gap-4">
                    {isVtPlus ? (
                        // VT+ Features
                        vtPlusFeatures.map(feature => (
                            <HoverCard key={feature.id}>
                                <HoverCardTrigger>
                                    <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-all duration-200 cursor-pointer">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 rounded-full bg-green-100 p-2 dark:bg-green-900/40">
                                                <IconCheck
                                                    size={14}
                                                    className="text-green-600 dark:text-green-400"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-foreground">{feature.name}</h4>
                                                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">{feature.name}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        ))
                    ) : (
                        // Free Plan Features
                        <HoverCard>
                            <HoverCardTrigger>
                                <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-all duration-200 cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 rounded-full bg-blue-100 p-2 dark:bg-blue-900/40">
                                            <IconCheck
                                                size={14}
                                                className="text-blue-600 dark:text-blue-400"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-foreground">Basic Chat</h4>
                                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                                Access to basic AI conversation features and standard models.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </HoverCardTrigger>
                            <HoverCardContent>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Basic Chat</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Essential AI chat features with access to standard language models.
                                    </p>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    )}
                </div>
            </div>

            {/* Upgrade Promotion for Free Users */}
            {!isVtPlus && (
                <div className="rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 dark:border-yellow-800 dark:from-yellow-950/20 dark:to-orange-950/20 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/40">
                            <IconSparkles
                                size={16}
                                className="text-yellow-600 dark:text-yellow-400"
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h4 className="text-base font-semibold text-yellow-900 dark:text-yellow-100">
                                    Unlock VT+ Features
                                </h4>
                                <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                                    Get access to advanced features including dark mode, pro search,
                                    and deep research capabilities.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>$9.99/month</strong> • Cancel anytime
                                </div>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleUpgradeToPlus}
                                    className="gap-2 self-start bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-0"
                                >
                                    <IconSparkles size={16} />
                                    Upgrade Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Billing Information for Plus Users */}
            {isVtPlus && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">Billing</h3>
                        <HoverCard>
                            <HoverCardTrigger>
                                <IconInfoCircle size={16} className="text-muted-foreground hover:text-foreground transition-colors" />
                            </HoverCardTrigger>
                            <HoverCardContent>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Billing Management</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Access your billing portal to manage payments and subscription.
                                    </p>
                                </div>
                            </HoverCardContent>
                        </HoverCard>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <span className="text-base font-semibold text-foreground">
                                    VT+ Monthly Subscription
                                </span>
                                <span className="text-muted-foreground text-sm">
                                    $9.99/month • Renews automatically
                                </span>
                            </div>
                            <Button
                                variant="outlined"
                                size="sm"
                                onClick={handleManageSubscription}
                                disabled={isPortalLoading}
                                className="gap-2 hover:bg-accent transition-colors"
                                tooltip={TOOLTIP_TEXT.MANAGE_BILLING_NEW_TAB}
                            >
                                <IconCreditCard size={16} />
                                {isPortalLoading ? BUTTON_TEXT.LOADING : BUTTON_TEXT.MANAGE_BILLING}
                                <IconExternalLink size={14} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useCreemSubscription, useCurrentPlan, useVtPlusAccess } from '@repo/common/hooks';
import { getEnabledVTPlusFeatures } from '@repo/shared/config/vt-plus-features';
import { BUTTON_TEXT } from '@repo/shared/constants';
import { PLANS, PlanSlug } from '@repo/shared/types/subscription';
import { Button, Card } from '@repo/ui';
import {
    IconCheck,
    IconCreditCard,
    IconCrown,
    IconExternalLink,
    IconSparkles,
    IconStar,
} from '@tabler/icons-react';
import { PaymentRedirectLoader } from './payment-redirect-loader';
import { UserTierBadge } from './user-tier-badge';

interface UsageCreditsSettingsProps {
    onClose?: () => void;
}

export function UsageCreditsSettings({ onClose }: UsageCreditsSettingsProps) {
    const isVtPlus = useVtPlusAccess();
    const { planSlug, isLoaded } = useCurrentPlan();
    const {
        openCustomerPortal,
        isPortalLoading,
        isLoading: isPaymentLoading,
    } = useCreemSubscription();

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
        <>
            <PaymentRedirectLoader
                isLoading={isPaymentLoading || isPortalLoading}
                message={
                    isPaymentLoading
                        ? 'Redirecting to secure payment...'
                        : 'Opening subscription portal...'
                }
            />
            <div className="space-y-6">
                {/* Current Plan Section */}
                <div className="space-y-4">
                    <h3 className="text-foreground text-lg font-semibold">Current Plan</h3>

                    <Card className="border bg-transparent p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="border-border rounded-full border p-3">
                                    {isVtPlus ? (
                                        <IconCrown size={24} className="text-foreground" />
                                    ) : (
                                        <IconStar size={24} className="text-foreground" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-foreground text-xl font-semibold">
                                            {currentPlan.name}
                                        </h4>
                                        <UserTierBadge />
                                    </div>
                                    <p className="text-muted-foreground max-w-md text-sm">
                                        {currentPlan.description}
                                    </p>
                                </div>
                            </div>
                            {isLoaded && (
                                <div className="shrink-0">
                                    {isVtPlus ? (
                                        <Button
                                            variant="outlined"
                                            size="sm"
                                            onClick={handleManageSubscription}
                                            disabled={isPortalLoading}
                                            className="gap-2"
                                        >
                                            <IconCreditCard size={16} />
                                            {isPortalLoading
                                                ? BUTTON_TEXT.LOADING
                                                : BUTTON_TEXT.MANAGE_SUBSCRIPTION}
                                            <IconExternalLink size={14} />
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={handleUpgradeToPlus}
                                            className="gap-2"
                                        >
                                            <IconSparkles size={16} />
                                            Upgrade to Plus
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Features Section */}
                <div className="space-y-4">
                    <h3 className="text-foreground text-lg font-semibold">Plan Features</h3>

                    <div className="grid gap-3">
                        {isVtPlus ? (
                            // VT+ Features
                            vtPlusFeatures.map(feature => (
                                <div
                                    key={feature.id}
                                    className="flex items-start gap-3 rounded-lg border bg-transparent p-3"
                                >
                                    <div className="border-border mt-0.5 rounded-full border p-1.5">
                                        <IconCheck size={14} className="text-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-foreground text-sm font-medium">
                                            {feature.name}
                                        </h4>
                                        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Free Plan Features
                            <div className="flex items-start gap-3 rounded-lg border bg-transparent p-3">
                                <div className="border-border mt-0.5 rounded-full border p-1.5">
                                    <IconCheck size={14} className="text-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-foreground text-sm font-medium">
                                        Basic Chat
                                    </h4>
                                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                                        Access to basic AI conversation features and standard
                                        models.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upgrade Promotion for Free Users */}
                {!isVtPlus && (
                    <Card className="border-primary/30 border bg-transparent p-6">
                        <div className="flex items-start gap-4">
                            <div className="border-primary/30 mt-1 rounded-full border p-2">
                                <IconSparkles size={16} className="text-foreground" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h4 className="text-foreground text-base font-semibold">
                                        Unlock VT+ Features
                                    </h4>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Get access to advanced features including dark mode and premium AI models.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-foreground text-sm font-medium">
                                        $9.99/month • Cancel anytime
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleUpgradeToPlus}
                                        className="gap-2"
                                    >
                                        <IconSparkles size={16} />
                                        Upgrade Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Billing Information for Plus Users */}
                {isVtPlus && (
                    <div className="space-y-4">
                        <h3 className="text-foreground text-lg font-semibold">Billing</h3>

                        <Card className="border bg-transparent p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-foreground text-base font-semibold">
                                        VT+ Monthly Subscription
                                    </h4>
                                    <p className="text-muted-foreground text-sm">
                                        $9.99/month • Renews automatically
                                    </p>
                                </div>
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    onClick={handleManageSubscription}
                                    disabled={isPortalLoading}
                                    className="gap-2"
                                >
                                    <IconCreditCard size={16} />
                                    {isPortalLoading
                                        ? BUTTON_TEXT.LOADING
                                        : BUTTON_TEXT.MANAGE_BILLING}
                                    <IconExternalLink size={14} />
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}

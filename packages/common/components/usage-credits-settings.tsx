'use client';

import React from 'react';
import { useCreemSubscription, useCurrentPlan, useVtPlusAccess } from '@repo/common/hooks';
import { getEnabledVTPlusFeatures } from '@repo/shared/config/vt-plus-features';
import { BUTTON_TEXT } from '@repo/shared/constants';
import { PLANS, PlanSlug } from '@repo/shared/types/subscription';
import { Button, Card, Badge } from '@repo/ui';
import { PaymentRedirectLoader } from './payment-redirect-loader';
import {
    IconCheck,
    IconCreditCard,
    IconExternalLink,
    IconSparkles,
    IconStar,
    IconCrown,
} from '@tabler/icons-react';
import { UserTierBadge } from './user-tier-badge';

interface UsageCreditsSettingsProps {
    onClose?: () => void;
}

export function UsageCreditsSettings({ onClose }: UsageCreditsSettingsProps) {
    const isVtPlus = useVtPlusAccess();
    const { planSlug, isLoaded } = useCurrentPlan();
    const { openCustomerPortal, isPortalLoading, isLoading: isPaymentLoading } = useCreemSubscription();

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
                message={isPaymentLoading ? "Redirecting to secure payment..." : "Opening subscription portal..."}
            />
            <div className="space-y-6">
            {/* Current Plan Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Current Plan</h3>

                <Card className="p-6 bg-transparent border">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="rounded-full p-3 border border-border">
                                {isVtPlus ? (
                                    <IconCrown size={24} className="text-foreground" />
                                ) : (
                                    <IconStar size={24} className="text-foreground" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-xl font-semibold text-foreground">
                                        {currentPlan.name}
                                    </h4>
                                    <UserTierBadge />
                                </div>
                                <p className="text-muted-foreground text-sm max-w-md">
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
                <h3 className="text-lg font-semibold text-foreground">Plan Features</h3>

                <div className="grid gap-3">
                    {isVtPlus ? (
                        // VT+ Features
                        vtPlusFeatures.map(feature => (
                            <div key={feature.id} className="flex items-start gap-3 p-3 rounded-lg border bg-transparent">
                                <div className="rounded-full border border-border p-1.5 mt-0.5">
                                    <IconCheck size={14} className="text-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-foreground">{feature.name}</h4>
                                    <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Free Plan Features
                        <div className="flex items-start gap-3 p-3 rounded-lg border bg-transparent">
                            <div className="rounded-full border border-border p-1.5 mt-0.5">
                                <IconCheck size={14} className="text-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-foreground">Basic Chat</h4>
                                <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                                    Access to basic AI conversation features and standard models.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upgrade Promotion for Free Users */}
            {!isVtPlus && (
                <Card className="p-6 bg-transparent border border-primary/30">
                    <div className="flex items-start gap-4">
                        <div className="rounded-full border border-primary/30 p-2 mt-1">
                            <IconSparkles size={16} className="text-foreground" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div>
                                <h4 className="text-base font-semibold text-foreground">
                                    Unlock VT+ Features
                                </h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Get access to advanced features including dark mode, pro search,
                                    and deep research capabilities.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium text-foreground">
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
                    <h3 className="text-lg font-semibold text-foreground">Billing</h3>

                    <Card className="p-6 bg-transparent border">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-base font-semibold text-foreground">
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
                                {isPortalLoading ? BUTTON_TEXT.LOADING : BUTTON_TEXT.MANAGE_BILLING}
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

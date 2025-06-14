'use client';

import { useCreemSubscription, useCurrentPlan, useVtPlusAccess } from '@repo/common/hooks';
import { getEnabledVTPlusFeatures } from '@repo/shared/config/vt-plus-features';
import { PLANS, PlanSlug } from '@repo/shared/types/subscription';
import { Button, Card } from '@repo/ui';
import { IconCheck, IconCreditCard, IconSparkles, IconStar } from '@tabler/icons-react';
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
        <div className="flex flex-col gap-6">
            {/* Current Plan Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold">Current Plan</h3>
                    <p className="text-muted-foreground text-sm">
                        Your current subscription tier and included features.
                    </p>
                </div>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <IconStar
                                size={20}
                                className={isVtPlus ? 'text-yellow-500' : 'text-gray-400'}
                            />
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{currentPlan.name} Plan</span>
                                    <UserTierBadge />
                                </div>
                                <span className="text-muted-foreground text-sm">
                                    {currentPlan.description}
                                </span>
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
                                        className="gap-2"
                                    >
                                        <IconCreditCard size={16} />
                                        {isPortalLoading ? 'Loading...' : 'Manage Subscription'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="default"
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
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold">Plan Features</h3>
                    <p className="text-muted-foreground text-sm">
                        Features included in your current plan.
                    </p>
                </div>

                <div className="grid gap-3">
                    {isVtPlus ? (
                        // VT+ Features
                        vtPlusFeatures.map(feature => (
                            <Card key={feature.id} className="p-3">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 rounded-full bg-green-100 p-1 dark:bg-green-900/40">
                                        <IconCheck
                                            size={12}
                                            className="text-green-600 dark:text-green-400"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium">{feature.name}</h4>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        // Free Plan Features
                        <Card className="p-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 rounded-full bg-blue-100 p-1 dark:bg-blue-900/40">
                                    <IconCheck
                                        size={12}
                                        className="text-blue-600 dark:text-blue-400"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium">Basic Chat</h4>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Access to basic AI conversation features and standard
                                        models.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Upgrade Promotion for Free Users */}
            {!isVtPlus && (
                <Card className="border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-yellow-100 p-1 dark:bg-yellow-900/40">
                            <IconSparkles
                                size={14}
                                className="text-yellow-600 dark:text-yellow-400"
                            />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div>
                                <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                    Unlock VT+ Features
                                </h4>
                                <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                                    Get access to advanced features including dark mode, pro search,
                                    and deep research capabilities.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="text-xs text-yellow-800 dark:text-yellow-200">
                                    <strong>$9.99/month</strong> • Cancel anytime
                                </div>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleUpgradeToPlus}
                                    className="gap-2 self-start"
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
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-base font-semibold">Billing</h3>
                        <p className="text-muted-foreground text-sm">
                            Manage your subscription and billing details.
                        </p>
                    </div>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium">
                                    VT+ Monthly Subscription
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    $9.99/month • Renews automatically
                                </span>
                            </div>
                            <Button
                                variant="outlined"
                                size="sm"
                                onClick={handleManageSubscription}
                                disabled={isPortalLoading}
                                className="gap-2"
                            >
                                <IconCreditCard size={16} />
                                {isPortalLoading ? 'Loading...' : 'Manage Billing'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

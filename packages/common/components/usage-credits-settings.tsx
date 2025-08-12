'use client';

import { useCreemSubscription, useCurrentPlan, useVtPlusAccess } from '@repo/common/hooks';
import { getEnabledVTPlusFeatures } from '@repo/shared/config/vt-plus-features';
import { BUTTON_TEXT, VT_PLUS_PRICE_WITH_INTERVAL } from '@repo/shared/constants';
import { log } from '@repo/shared/logger';
import { PLANS, PlanSlug } from '@repo/shared/types/subscription';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Skeleton,
    TypographyH3,
    TypographyMuted,
} from '@repo/ui';
import { PaymentRedirectLoader } from './payment-redirect-loader';
import { RateLimitMeter } from './rate-limit-meter';
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
            log.error({ data: error }, 'Failed to open subscription portal');
        }
    };

    const handleUpgradeToPlus = () => {
        // Close settings modal and navigate to pricing page
        onClose?.();
        window.location.href = '/pricing';
    };

    return (
        <>
            <PaymentRedirectLoader isLoading={isPaymentLoading || isPortalLoading} />
            <div className='space-y-6'>
                {/* Header */}
                <div className='flex items-center gap-3'>
                    <div>
                        <TypographyH3>Subscription</TypographyH3>
                        <TypographyMuted>Manage your plan and billing settings</TypographyMuted>
                    </div>
                </div>

                {/* Current Plan Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>Current Plan</CardTitle>
                        <CardDescription>
                            Your current subscription plan and features
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='border-border/50 bg-muted/20 rounded-lg border p-4'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <div className='text-foreground text-lg font-semibold'>
                                                {currentPlan.name}
                                            </div>
                                            <UserTierBadge />
                                        </div>
                                        <div className='text-muted-foreground max-w-md text-sm'>
                                            {currentPlan.description}
                                        </div>
                                    </div>
                                </div>
                                {isLoaded
                                    ? (
                                        <div className='shrink-0'>
                                            {isVtPlus
                                                ? (
                                                    <Button
                                                        disabled={isPortalLoading}
                                                        onClick={handleManageSubscription}
                                                        size='sm'
                                                        variant='outline'
                                                    >
                                                        {isPortalLoading
                                                            ? BUTTON_TEXT.LOADING
                                                            : BUTTON_TEXT.MANAGE_SUBSCRIPTION}
                                                    </Button>
                                                )
                                                : (
                                                    <Button onClick={handleUpgradeToPlus} size='sm'>
                                                        Upgrade to VT+
                                                    </Button>
                                                )}
                                        </div>
                                    )
                                    : (
                                        <div className='shrink-0'>
                                            <Skeleton className='h-9 w-24 rounded-md' />
                                        </div>
                                    )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Features Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>Plan Features</CardTitle>
                        <CardDescription>
                            What's included in your {currentPlan.name} plan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='grid gap-3'>
                            {isVtPlus
                                ? (
                                    // VT+ Features
                                    vtPlusFeatures.map((feature) => (
                                        <div
                                            className='border-border/50 bg-muted/20 flex items-start gap-3 rounded-lg border p-3'
                                            key={feature.id}
                                        >
                                            <div className='min-w-0 flex-1'>
                                                <div className='text-foreground text-sm font-medium'>
                                                    {feature.name}
                                                </div>
                                                <div className='text-muted-foreground mt-1 text-xs leading-relaxed'>
                                                    {feature.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )
                                : (
                                    // Free Plan Features
                                    <div className='border-border/50 bg-muted/20 flex items-start gap-3 rounded-lg border p-3'>
                                        <div className='min-w-0 flex-1'>
                                            <div className='text-foreground text-sm font-medium'>
                                                Basic Chat
                                            </div>
                                            <div className='text-muted-foreground mt-1 text-xs leading-relaxed'>
                                                Access to basic AI conversation features and
                                                standard models.
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </CardContent>
                </Card>

                {/* Rate Limit Meter for Free Users */}
                {!isVtPlus && <RateLimitMeter />}

                {/* Upgrade Promotion for Free Users */}
                {!isVtPlus && (
                    <Card className='border-primary/30 border bg-transparent p-6'>
                        <div className='flex items-start gap-4'>
                            <div className='flex-1 space-y-3'>
                                <div>
                                    <h4 className='text-foreground text-base font-semibold'>
                                        Unlock VT+ Features
                                    </h4>
                                    <p className='text-muted-foreground mt-1 text-sm'>
                                        Get access to advanced features including dark mode and
                                        premium AI models.
                                    </p>
                                </div>
                                <div className='space-y-2'>
                                    <div className='text-foreground text-sm font-medium'>
                                        {VT_PLUS_PRICE_WITH_INTERVAL}{' '}
                                        • Free trial included • Cancel anytime
                                    </div>
                                    <Button
                                        className='w-full sm:w-auto'
                                        onClick={handleUpgradeToPlus}
                                        size='sm'
                                    >
                                        Upgrade Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Billing Information for Plus Users */}
                {isVtPlus && (
                    <div className='space-y-4'>
                        <h3 className='text-foreground text-lg font-semibold'>Billing</h3>

                        <Card className='border bg-transparent p-6'>
                            <div className='flex items-center justify-between'>
                                <div className='space-y-1'>
                                    <h4 className='text-foreground text-base font-semibold'>
                                        VT+ Monthly Subscription
                                    </h4>
                                </div>
                                <Button
                                    disabled={isPortalLoading}
                                    onClick={handleManageSubscription}
                                    size='sm'
                                    variant='outline'
                                >
                                    {isPortalLoading
                                        ? BUTTON_TEXT.LOADING
                                        : BUTTON_TEXT.MANAGE_BILLING}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}

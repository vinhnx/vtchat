'use client';

import { PAYMENT_EVENT_TYPES } from '@repo/shared/constants';
import { useSession } from '@repo/shared/lib/auth-client';
import { PlanSlug } from '@repo/shared/types/subscription';
import { useEffect, useRef } from 'react';
import { useSubscriptionAccess } from '../hooks/use-subscription-access';
import { useVemetric } from '../hooks/use-vemetric';
import { ANALYTICS_EVENTS, AnalyticsUtils } from '../utils/analytics';
import { log } from '@repo/shared/logger';

/**
 * Component that tracks subscription-related analytics events
 */
export function VemetricSubscriptionTracker() {
    const { trackEvent, updateUser, isEnabled } = useVemetric();
    const { data: session } = useSession();
    const { currentPlan, isLoaded } = useSubscriptionAccess();

    // Refs to track previous values
    const prevUserTier = useRef<string | undefined>();
    const hasTrackedInitialState = useRef(false);

    // Track subscription tier changes
    useEffect(() => {
        if (!isEnabled || !session || !isLoaded) return;

        const currentTier = currentPlan || PlanSlug.VT_BASE;

        // Track initial state only once
        if (!hasTrackedInitialState.current) {
            try {
                updateUser({
                    subscriptionTier: currentTier as PlanSlug,
                });
                hasTrackedInitialState.current = true;
                prevUserTier.current = currentTier;
            } catch (error) {
                log.error({ error }, 'Failed to update user subscription tier');
            }
            return;
        }

        // Track subscription changes
        if (prevUserTier.current && prevUserTier.current !== currentTier) {
            try {
                const eventData = AnalyticsUtils.createSubscriptionEventData({
                    tier: currentTier as PlanSlug,
                });

                // Determine the type of change
                const isUpgrade =
                    prevUserTier.current === PlanSlug.VT_BASE && currentTier === PlanSlug.VT_PLUS;
                const isDowngrade =
                    prevUserTier.current === PlanSlug.VT_PLUS && currentTier === PlanSlug.VT_BASE;

                if (isUpgrade) {
                    trackEvent(ANALYTICS_EVENTS.PLAN_UPGRADE_COMPLETED, {
                        ...eventData,
                        previousTier: prevUserTier.current,
                    });
                } else if (isDowngrade) {
                    trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED, {
                        ...eventData,
                        previousTier: prevUserTier.current,
                    });
                } else {
                    trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_RENEWED, eventData);
                }

                // Update user properties
                updateUser({
                    subscriptionTier: currentTier as PlanSlug,
                });
            } catch (error) {
                log.error(
                    { error, prevTier: prevUserTier.current, currentTier },
                    'Failed to track subscription change'
                );
            }
        }

        prevUserTier.current = currentTier;
    }, [currentPlan, isLoaded, trackEvent, updateUser, isEnabled, session]);

    return null; // This component doesn't render anything
}

/**
 * Hook to track subscription-related user actions
 */
export function useVemetricSubscriptionTracking() {
    const { trackEvent, isEnabled } = useVemetric();
    const { data: session } = useSession();

    const trackUpgradeInitiated = async (context?: string) => {
        if (!isEnabled || !session) return;

        try {
            await trackEvent(ANALYTICS_EVENTS.PLAN_UPGRADE_INITIATED, {
                context,
                timestamp: Date.now(),
            });
        } catch (error) {
            log.error({ error }, 'Failed to track upgrade initiation');
        }
    };

    const trackFeatureGateEncountered = async (params: {
        featureName: string;
        requiredTier: string;
        context?: string;
    }) => {
        if (!isEnabled || !session) return;

        try {
            await trackEvent(ANALYTICS_EVENTS.FEATURE_GATE_ENCOUNTERED, {
                featureName: params.featureName,
                requiredTier: params.requiredTier,
                context: params.context,
                timestamp: Date.now(),
            });
        } catch (error) {
            log.error({ error }, 'Failed to track feature gate encounter');
        }
    };

    const trackPaymentEvent = async (params: {
        event: (typeof PAYMENT_EVENT_TYPES)[keyof typeof PAYMENT_EVENT_TYPES];
        tier: PlanSlug.VT_PLUS;
        amount?: number;
        currency?: string;
        paymentMethod?: string;
    }) => {
        if (!isEnabled || !session) return;

        try {
            const eventData = AnalyticsUtils.createSubscriptionEventData({
                tier: params.tier,
                price: params.amount,
                currency: params.currency,
            });

            await trackEvent(
                params.event === PAYMENT_EVENT_TYPES.PAYMENT_COMPLETED
                    ? ANALYTICS_EVENTS.SUBSCRIPTION_CREATED
                    : ANALYTICS_EVENTS.PAYMENT_EVENT,
                {
                    ...eventData,
                    event: params.event,
                    paymentMethod: params.paymentMethod,
                }
            );
        } catch (error) {
            log.error({ error }, 'Failed to track payment event');
        }
    };

    return {
        trackUpgradeInitiated,
        trackFeatureGateEncountered,
        trackPaymentEvent,
        isEnabled,
    };
}

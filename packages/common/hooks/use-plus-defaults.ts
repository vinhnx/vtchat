'use client';

/**
 * Plus Defaults Hook
 *
 * Automatically applies plus user default settings when subscription status changes
 */

import { log } from '@repo/shared/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import { useEffect, useRef } from 'react';
import { useGlobalSubscriptionStatus } from '../providers/subscription-provider';
import { useAppStore } from '../store/app.store';

/**
 * Hook to automatically apply plus defaults when user subscription changes
 */
export function usePlusDefaults() {
    const { isPlusSubscriber, plan, isLoading } = useGlobalSubscriptionStatus();
    const { initializeSettingsForPlan, applyPlusDefaults } = useAppStore();
    const previousPlanRef = useRef<PlanSlug | null>(null);
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        // Don't apply settings while subscription is still loading
        if (isLoading) return;

        const currentPlan = plan as PlanSlug;
        const previousPlan = previousPlanRef.current;

        // Initial setup - apply defaults for current plan
        if (!hasInitializedRef.current) {
            log.info({ plan: currentPlan }, '[Plus Defaults] Initial setup for plan');
            initializeSettingsForPlan(currentPlan);
            hasInitializedRef.current = true;
            previousPlanRef.current = currentPlan;
            return;
        }

        // Handle plan changes (upgrade/downgrade)
        if (previousPlan && previousPlan !== currentPlan) {
            log.info({ previousPlan, currentPlan }, '[Plus Defaults] Plan changed');

            if (currentPlan === PlanSlug.VT_PLUS && previousPlan === PlanSlug.VT_BASE) {
                // Upgrading to plus - apply plus defaults but preserve user customizations
                log.info('[Plus Defaults] Upgrading to VT+, applying plus defaults');
                applyPlusDefaults(currentPlan, true);
            } else if (currentPlan === PlanSlug.VT_BASE && previousPlan === PlanSlug.VT_PLUS) {
                // Downgrading to base - apply base defaults
                log.info('[Plus Defaults] Downgrading to base, applying base defaults');
                initializeSettingsForPlan(currentPlan);
            }
        }

        previousPlanRef.current = currentPlan;
    }, [plan, isPlusSubscriber, isLoading, initializeSettingsForPlan, applyPlusDefaults]);

    return {
        isPlusSubscriber,
        plan,
        isLoading,
    };
}

/**
 * Hook to manually trigger plus defaults application
 * Useful for settings UI or manual user actions
 */
export function usePlusDefaultsControl() {
    const { isPlusSubscriber, plan } = useGlobalSubscriptionStatus();
    const { applyPlusDefaults, initializeSettingsForPlan } = useAppStore();

    const enablePlusDefaults = () => {
        if (isPlusSubscriber && plan === PlanSlug.VT_PLUS) {
            applyPlusDefaults(PlanSlug.VT_PLUS, false); // Don't preserve user changes
        }
    };

    const resetToDefaults = () => {
        const currentPlan = (plan as PlanSlug) || PlanSlug.VT_BASE;
        initializeSettingsForPlan(currentPlan);
    };

    return {
        enablePlusDefaults,
        resetToDefaults,
        canApplyPlusDefaults: isPlusSubscriber && plan === PlanSlug.VT_PLUS,
    };
}

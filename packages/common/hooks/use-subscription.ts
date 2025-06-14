'use client';

import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { UserClientSubscriptionStatus } from '@repo/shared/utils/subscription';
import { useCallback } from 'react';
import { useGlobalSubscriptionStatus } from '../providers/subscription-provider';

// Define a more specific UserProfile type based on what /api/user/profile returns
// This is kept for backward compatibility but no longer fetched by this hook
export interface UserProfile {
    id: string;
    email?: string | null;
    planSlug?: PlanSlug | null;
    publicMetadata?: {
        planSlug?: PlanSlug;
        subscription?: {
            planSlug?: PlanSlug;
            plan?: PlanSlug;
            isActive?: boolean;
            expiresAt?: string;
        };
    };
    privateMetadata?: {
        subscription?: {
            planSlug?: PlanSlug;
            plan?: PlanSlug;
            isActive?: boolean;
            expiresAt?: string;
        };
    };
}

// The hook's return type
export interface UseSubscriptionResult {
    subscriptionStatus: UserClientSubscriptionStatus;
    userProfile: UserProfile | null; // No longer fetched, kept for compatibility
    isLoading: boolean;
    error: string | null;
    isVTPlus: boolean;
    refetch: () => Promise<void>;
}

/**
 * Subscription hook for VTChat - MIGRATED TO GLOBAL PROVIDER
 *
 * This hook now uses the global SubscriptionProvider instead of making
 * its own API calls to /api/user/profile. This eliminates redundancy
 * and ensures all subscription state is centralized.
 *
 * @deprecated Consider using useGlobalSubscriptionStatus directly
 */
export function useSubscription(): UseSubscriptionResult {
    const {
        subscriptionStatus: globalStatus,
        isLoading,
        error,
        refreshSubscriptionStatus,
    } = useGlobalSubscriptionStatus();

    // Convert the global subscription status to the expected format
    const subscriptionStatus: UserClientSubscriptionStatus = {
        currentPlanSlug: (globalStatus?.plan as PlanSlug) || PlanSlug.VT_BASE,
        planConfig: {
            slug: (globalStatus?.plan as PlanSlug) || PlanSlug.VT_BASE,
            name: globalStatus?.plan === PlanSlug.VT_PLUS ? 'VT+' : 'Base',
            description:
                globalStatus?.plan === PlanSlug.VT_PLUS ? 'Enhanced features' : 'Basic access',
            features: [], // Populated from PLANS config elsewhere
            isDefault: globalStatus?.plan === PlanSlug.VT_BASE,
        },
        status:
            globalStatus?.status === SubscriptionStatusEnum.ACTIVE
                ? SubscriptionStatusEnum.ACTIVE
                : SubscriptionStatusEnum.NONE,
        isPremium: globalStatus?.isPlusSubscriber || false,
        isVtPlus: globalStatus?.isPlusSubscriber || false,
        isVtBase: !globalStatus?.isPlusSubscriber,
        canUpgrade: !globalStatus?.isPlusSubscriber,
        isActive: globalStatus?.status === SubscriptionStatusEnum.ACTIVE,
        expiresAt: globalStatus?.currentPeriodEnd,
        source: globalStatus?.hasSubscription ? 'creem' : 'none',
    };

    // No longer fetch user profile - this was causing redundant API calls
    const userProfile: UserProfile | null = null;

    const refetch = useCallback(async () => {
        await refreshSubscriptionStatus(true, 'manual');
    }, [refreshSubscriptionStatus]);

    // Convenience flag derived from the subscription status
    const isVTPlus = subscriptionStatus.isVtPlus && subscriptionStatus.isActive;

    return {
        subscriptionStatus,
        userProfile,
        isLoading,
        error,
        isVTPlus,
        refetch,
    };
}

export default useSubscription;

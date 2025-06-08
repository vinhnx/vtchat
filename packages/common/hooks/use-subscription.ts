'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    getSubscriptionStatus,
    SubscriptionContext, // This is { user?: any; }
    UserClientSubscriptionStatus,
} from '@repo/shared/utils/subscription';
import { PlanSlug } from '@repo/shared/types/subscription'; // For default values
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';

// Define a more specific UserProfile type based on what /api/user/profile returns
// and what getSubscriptionStatus expects in its context.user
export interface UserProfile {
    id: string;
    email?: string | null;
    // Assuming the user object from /api/user/profile might contain these:
    publicMetadata?: {
        planSlug?: PlanSlug;
        subscription?: {
            planSlug?: PlanSlug;
            plan?: PlanSlug; // Legacy support
            isActive?: boolean;
            expiresAt?: string; // ISO Date string
        };
    };
    privateMetadata?: {
         subscription?: {
            planSlug?: PlanSlug;
            plan?: PlanSlug; // Legacy support
            isActive?: boolean;
            expiresAt?: string; // ISO Date string
        };
    };
    // Include other relevant fields from your actual user profile structure
    // For example, if planSlug is a top-level property:
    planSlug?: PlanSlug | null;
}

// The hook's return type
export interface UseSubscriptionResult {
    subscriptionStatus: UserClientSubscriptionStatus; // No longer nullable, provides default
    userProfile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    isVTPlus: boolean; // Convenience flag
    refetch: () => Promise<void>;
}

const defaultSubscriptionStatus: UserClientSubscriptionStatus = {
    currentPlanSlug: PlanSlug.VT_BASE,
    planConfig: { // Provide a default PlanConfig for VT_BASE
        slug: PlanSlug.VT_BASE,
        name: 'Base',
        description: 'Basic access',
        features: [], // Define actual base features if known, or keep empty
        isDefault: true,
    },
    status: SubscriptionStatusEnum.NONE,
    isPremium: false,
    isVtPlus: false,
    isVtBase: true,
    canUpgrade: true,
    isActive: false, // Default to not active until user data confirms
    expiresAt: undefined,
    source: 'none',
};


/**
 * Subscription hook for VTChat
 * Leverages @repo/shared/utils/subscription for status determination
 */
export function useSubscription(): UseSubscriptionResult {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<UserClientSubscriptionStatus>(defaultSubscriptionStatus);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserDataAndSubscription = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch user data from your API
            const response = await fetch('/api/user/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                // If user is not logged in (e.g., 401), they have default/anonymous status
                if (response.status === 401 || response.status === 403) {
                    setUserProfile(null);
                    const anonContext: SubscriptionContext = { user: null };
                    setSubscriptionStatus(getSubscriptionStatus(anonContext));
                    return; // Exit early
                }
                throw new Error(`Failed to fetch user data: ${response.statusText} (${response.status})`);
            }

            const profileData = await response.json();

            // Ensure profileData.user exists and is an object
            const fetchedUser = profileData && typeof profileData.user === 'object' ? profileData.user : null;
            setUserProfile(fetchedUser as UserProfile | null);

            // Determine subscription status using the fetched user profile
            const context: SubscriptionContext = { user: fetchedUser };
            setSubscriptionStatus(getSubscriptionStatus(context));

        } catch (err) {
            console.error('Error in useSubscription:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setUserProfile(null);
            // In case of error, set to default/anonymous status
            const errorContext: SubscriptionContext = { user: null };
            setSubscriptionStatus(getSubscriptionStatus(errorContext));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserDataAndSubscription();
    }, [fetchUserDataAndSubscription]);

    // Convenience flag, derived from the detailed subscriptionStatus
    const isVTPlus = subscriptionStatus.isVtPlus && subscriptionStatus.isActive;

    return {
        subscriptionStatus,
        userProfile,
        isLoading,
        error,
        isVTPlus,
        refetch: fetchUserDataAndSubscription,
    };
}

export default useSubscription;

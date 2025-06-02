'use client';

import { useAuth } from '@clerk/nextjs';
import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import { checkSubscriptionAccess } from '@repo/shared/utils/subscription';
import { Alert, AlertDescription, AlertTitle, Button } from '@repo/ui';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export interface GatedFeatureAlertProps {
    /** The feature that requires a higher plan */
    requiredFeature?: FeatureSlug;
    /** The plan that is required to access the feature */
    requiredPlan?: PlanSlug;
    /** Custom message to display in the alert */
    message?: string;
    /** Custom title for the alert */
    title?: string;
    /** Callback triggered when the feature is clicked and the user doesn't have access */
    onGatedClick?: () => void;
    /** Custom upgrade URL */
    upgradeUrl?: string;
    /** Children to render when the user has access to the feature */
    children: React.ReactNode;
    /** Alternative content to show when user doesn't have access */
    fallback?: React.ReactNode;
    /** Whether to show the upgrade alert or just hide the content */
    showAlert?: boolean;
}

/**
 * GatedFeatureAlert - A component that gates content behind subscription features/plans
 *
 * This component checks if the user has access to a specific feature or plan and either:
 * 1. Shows the children if they have access
 * 2. Shows an upgrade alert if they don't have access and try to interact
 * 3. Shows a fallback component if provided
 *
 * @example
 * ```tsx
 * // Gate by feature
 * <GatedFeatureAlert
 *   requiredFeature={FeatureSlug.DARK_MODE}
 *   title="Dark Mode Available in VT+"
 *   message="Dark mode is a VT+ feature. Upgrade to enjoy a better viewing experience."
 * >
 *   <DarkModeToggle />
 * </GatedFeatureAlert>
 *
 * // Gate by plan
 * <GatedFeatureAlert
 *   requiredPlan={PlanSlug.VT_PLUS}
 *   fallback={<div>This feature requires VT+</div>}
 * >
 *   <PremiumFeature />
 * </GatedFeatureAlert>
 * ```
 */
export const GatedFeatureAlert: React.FC<GatedFeatureAlertProps> = ({
    requiredFeature,
    requiredPlan,
    message,
    title = 'Upgrade Required',
    onGatedClick,
    upgradeUrl = '/plus',
    children,
    fallback,
    showAlert = true,
}) => {
    const { isLoaded, has } = useAuth();
    const router = useRouter();
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);

    // Don't render anything while auth is loading
    if (!isLoaded) {
        return null;
    }

    // Check if user has access based on feature or plan
    const hasAccess = React.useMemo(() => {
        if (!has) return false;

        if (requiredFeature) {
            return checkSubscriptionAccess(has, { feature: requiredFeature });
        }

        if (requiredPlan) {
            return checkSubscriptionAccess(has, { plan: requiredPlan });
        }

        return true;
    }, [has, requiredFeature, requiredPlan]);

    // Generate default message based on feature/plan
    const defaultMessage = React.useMemo(() => {
        if (message) return message;

        if (requiredFeature) {
            const featureName = requiredFeature
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            return `${featureName} is a VT+ feature. Please upgrade your plan to use this feature.`;
        }

        if (requiredPlan === PlanSlug.VT_PLUS) {
            return 'This feature requires VT+ plan. Please upgrade to access this feature.';
        }

        return 'This feature requires a higher plan. Please upgrade to continue.';
    }, [message, requiredFeature, requiredPlan]);

    const handleUpgrade = () => {
        router.push(upgradeUrl);
        setShowUpgradeAlert(false);
    };

    const handleGatedInteraction = () => {
        if (onGatedClick) {
            onGatedClick();
        }
        if (showAlert) {
            setShowUpgradeAlert(true);
        }
    };

    // If user has access, render children normally
    if (hasAccess) {
        return <>{children}</>;
    }

    // If no fallback and no alert, return null
    if (!fallback && !showAlert) {
        return null;
    }

    // If fallback is provided, show it
    if (fallback) {
        return <>{fallback}</>;
    }

    // Create gated version of children that shows alert on interaction
    const gatedChildren = React.cloneElement(children as React.ReactElement, {
        onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            handleGatedInteraction();
        },
        style: {
            ...(children as React.ReactElement).props?.style,
            cursor: 'pointer',
            opacity: 0.7,
        },
    });

    return (
        <>
            {gatedChildren}
            {showUpgradeAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <Alert className="max-w-md">
                        <AlertTitle>{title}</AlertTitle>
                        <AlertDescription>{defaultMessage}</AlertDescription>
                        <div className="mt-4 flex justify-end space-x-2">
                            <Button
                                variant="outlined"
                                size="sm"
                                onClick={() => setShowUpgradeAlert(false)}
                            >
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleUpgrade}>
                                Upgrade Now
                            </Button>
                        </div>
                    </Alert>
                </div>
            )}
        </>
    );
};

/**
 * Hook for checking if a feature is gated
 * Useful for conditional rendering without the full gated component
 */
export const useFeatureGate = (requiredFeature?: FeatureSlug, requiredPlan?: PlanSlug) => {
    const { isLoaded, has } = useAuth();

    const hasAccess = React.useMemo(() => {
        if (!isLoaded || !has) return false;

        if (requiredFeature) {
            return checkSubscriptionAccess(has, { feature: requiredFeature });
        }

        if (requiredPlan) {
            return checkSubscriptionAccess(has, { plan: requiredPlan });
        }

        return true;
    }, [isLoaded, has, requiredFeature, requiredPlan]);

    return {
        hasAccess,
        isLoaded,
    };
};

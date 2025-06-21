'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@repo/ui';
import { Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useVtPlusAccess } from '../hooks/use-subscription-access';

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
 *   requiredFeature={FeatureSlug.DARK_THEME}
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
    title = 'Unlock Premium Features',
    onGatedClick,
    upgradeUrl = '/plus',
    children,
    fallback,
    showAlert = true,
}) => {
    const { data: session } = useSession();
    const router = useRouter();
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
    const isVtPlus = useVtPlusAccess(); // Use the VT+ access hook that checks Creem subscription

    // Check if user has access based on feature or plan
    const hasAccess = React.useMemo(() => {
        // If no session, no access
        if (!session) return false;
        
        // VT+ exclusive features
        if (
            requiredFeature === FeatureSlug.DARK_THEME ||
            requiredFeature === FeatureSlug.DEEP_RESEARCH ||
            requiredFeature === FeatureSlug.PRO_SEARCH ||
            requiredFeature === FeatureSlug.CHART_VISUALIZATION ||
            requiredPlan === PlanSlug.VT_PLUS
        ) {
            return isVtPlus;
        }

        // For base features, always allow access for authenticated users
        if (
            requiredFeature &&
            (requiredFeature === FeatureSlug.ACCESS_CHAT ||
                requiredFeature === FeatureSlug.BASE_MODELS ||
                requiredFeature === FeatureSlug.ADVANCED_CHAT_MODES)
        ) {
            return true; // Base features are available to all authenticated users
        }

        // For base plan requirements, allow access
        if (requiredPlan === PlanSlug.VT_BASE) {
            return true; // Base plan features are available to all authenticated users
        }

        return true;
    }, [requiredFeature, requiredPlan, isVtPlus, session]);

    // Generate default message based on feature/plan
    const defaultMessage = React.useMemo(() => {
        if (message) return message;

        if (requiredFeature) {
            const featureName = requiredFeature
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            return `Unlock ${featureName} with VT+! Upgrade now to enjoy enhanced AI capabilities and unlock your potential.`;
        }

        if (requiredPlan === PlanSlug.VT_PLUS) {
            return 'Ready for more? This amazing feature is available with VT+. Join our community of power users today!';
        }

        return 'Discover premium features! Upgrade your plan to unlock advanced capabilities and elevate your experience.';
    }, [message, requiredFeature, requiredPlan]);

    // Don't render anything while auth is loading
    if (!session) {
        return null;
    }

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
            <Dialog open={showUpgradeAlert} onOpenChange={setShowUpgradeAlert}>
                <DialogContent ariaTitle={title} className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{defaultMessage}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3">
                        <Button variant="outline" onClick={() => setShowUpgradeAlert(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpgrade} className="gap-2">
                            <Crown size={16} />
                            Upgrade Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

/**
 * Hook for checking if a feature is gated
 * Useful for conditional rendering without the full gated component
 */
export const useFeatureGate = (requiredFeature?: FeatureSlug, requiredPlan?: PlanSlug) => {
    const { data: session } = useSession();
    const isVtPlus = useVtPlusAccess(); // Use the VT+ access hook that checks Creem subscription

    const hasAccess = React.useMemo(() => {
        if (!session) return false;

        // VT+ exclusive features
        if (
            requiredFeature === FeatureSlug.DARK_THEME ||
            requiredFeature === FeatureSlug.DEEP_RESEARCH ||
            requiredFeature === FeatureSlug.PRO_SEARCH ||
            requiredFeature === FeatureSlug.CHART_VISUALIZATION ||
            requiredPlan === PlanSlug.VT_PLUS
        ) {
            return isVtPlus;
        }

        // For base features, always allow access for authenticated users
        if (
            requiredFeature &&
            (requiredFeature === FeatureSlug.ACCESS_CHAT ||
                requiredFeature === FeatureSlug.BASE_MODELS ||
                requiredFeature === FeatureSlug.FREE_MODELS ||
                requiredFeature === FeatureSlug.MATH_CALCULATOR ||
                requiredFeature === FeatureSlug.BASE_FEATURES ||
                requiredFeature === FeatureSlug.ADVANCED_CHAT_MODES)
        ) {
            return true;
        }

        // For base plan requirements, allow access
        if (requiredPlan === PlanSlug.VT_BASE) {
            return true;
        }

        return true;
    }, [session, requiredFeature, requiredPlan, isVtPlus]);

    const isLoaded = !!session;

    return {
        hasAccess,
        isLoaded,
    };
};

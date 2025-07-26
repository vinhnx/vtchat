"use client";

import { useSession } from "@repo/shared/lib/auth-client";
import { FeatureSlug, PlanSlug } from "@repo/shared/types/subscription";
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@repo/ui";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useVtPlusAccess } from "../hooks/use-subscription-access";

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
    title = "Unlock Premium Features",
    onGatedClick,
    upgradeUrl = "/pricing",
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

        // VT+ exclusive features (now only PRO_SEARCH, DEEP_RESEARCH, RAG)
        if (
            requiredFeature === FeatureSlug.DEEP_RESEARCH ||
            requiredFeature === FeatureSlug.PRO_SEARCH
        ) {
            return isVtPlus;
        }

        // Features now available to all logged-in users
        if (
            requiredFeature === FeatureSlug.DARK_THEME ||
            requiredFeature === FeatureSlug.THINKING_MODE_TOGGLE ||
            requiredFeature === FeatureSlug.STRUCTURED_OUTPUT ||
            requiredFeature === FeatureSlug.THINKING_MODE ||
            requiredFeature === FeatureSlug.DOCUMENT_PARSING ||
            requiredFeature === FeatureSlug.REASONING_CHAIN ||
            requiredFeature === FeatureSlug.GEMINI_EXPLICIT_CACHING ||
            requiredFeature === FeatureSlug.CHART_VISUALIZATION
        ) {
            return true; // Available to all logged-in users
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
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
            return `Unlock ${featureName} with VT+! Upgrade now to enjoy enhanced AI capabilities and unlock your potential.`;
        }

        if (requiredPlan === PlanSlug.VT_PLUS) {
            return "Ready for more? This amazing feature is available with VT+. Join our community of power users today!";
        }

        return "Discover premium features! Upgrade your plan to unlock advanced capabilities and elevate your experience.";
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
    if (!(fallback || showAlert)) {
        return null;
    }

    // If fallback is provided, show it
    if (fallback) {
        return <>{fallback}</>;
    }

    // Create gated version of children that shows alert on interaction
    // In React 19, we need to ensure we're only cloning valid elements that can receive DOM props
    const gatedChildren =
        React.isValidElement(children) && typeof children.type !== "symbol" ? (
            React.cloneElement(children as React.ReactElement<any>, {
                onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleGatedInteraction();
                },
                style: {
                    ...(children as React.ReactElement<any>).props?.style,
                    cursor: "pointer",
                    opacity: 0.7,
                },
            })
        ) : (
            // If children can't receive DOM props, wrap in a div
            <div
                onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleGatedInteraction();
                }}
                style={{
                    cursor: "pointer",
                    opacity: 0.7,
                }}
            >
                {children}
            </div>
        );

    return (
        <>
            {gatedChildren}
            <Dialog onOpenChange={setShowUpgradeAlert} open={showUpgradeAlert}>
                <DialogContent className="max-w-md border-0 bg-gradient-to-br from-white to-gray-50 shadow-2xl">
                    <DialogHeader className="pb-4 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="leading-relaxed text-gray-600">
                            {defaultMessage}
                        </DialogDescription>

                        {/* Free Trial & Cancel Anytime */}
                        <div className="mt-3 flex items-center justify-center gap-3">
                            <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs">
                                <Sparkles className="h-3 w-3 text-green-600" />
                                <span className="font-medium text-green-700">
                                    Free trial included
                                </span>
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs">
                                <span className="h-3 w-3 text-blue-600">✓</span>
                                <span className="font-medium text-blue-700">Cancel anytime</span>
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="gap-3 pt-4">
                        <Button
                            className="border-gray-200 text-gray-600 hover:bg-gray-50"
                            onClick={() => setShowUpgradeAlert(false)}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 font-semibold shadow-lg hover:from-amber-600 hover:to-orange-600"
                            onClick={handleUpgrade}
                        >
                            <Sparkles size={16} />
                            Upgrade to VT+
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

        // VT+ exclusive features (now only PRO_SEARCH, DEEP_RESEARCH, RAG)
        if (
            requiredFeature === FeatureSlug.DEEP_RESEARCH ||
            requiredFeature === FeatureSlug.PRO_SEARCH ||
            requiredPlan === PlanSlug.VT_PLUS
        ) {
            return isVtPlus;
        }

        // Features now available to all logged-in users
        if (
            requiredFeature === FeatureSlug.DARK_THEME ||
            requiredFeature === FeatureSlug.THINKING_MODE_TOGGLE ||
            requiredFeature === FeatureSlug.STRUCTURED_OUTPUT ||
            requiredFeature === FeatureSlug.THINKING_MODE ||
            requiredFeature === FeatureSlug.DOCUMENT_PARSING ||
            requiredFeature === FeatureSlug.REASONING_CHAIN ||
            requiredFeature === FeatureSlug.GEMINI_EXPLICIT_CACHING ||
            requiredFeature === FeatureSlug.CHART_VISUALIZATION
        ) {
            return true; // Available to all logged-in users
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

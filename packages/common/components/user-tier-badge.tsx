'use client';

import { useCurrentPlan, useVtPlusAccess } from '@repo/common/hooks/use-subscription-access';
import { PLANS, PlanSlug } from '@repo/shared/types/subscription';
import { Badge, cn } from '@repo/ui';

interface UserTierBadgeProps {
    className?: string;
    showUpgradePrompt?: boolean;
    onUpgradeClick?: () => void;
}

/**
 * UserTierBadge Component
 *
 * Displays the current user's subscription tier with minimal styling.
 * Uses optimized subscription hooks for real-time subscription checking.
 */

export function UserTierBadge({
    className,
    showUpgradePrompt = false,
    onUpgradeClick,
}: UserTierBadgeProps) {
    const isPlusTier = useVtPlusAccess();
    const { planSlug: rawPlanSlug, isVtPlus } = useCurrentPlan();

    // Use isPlusTier from useVtPlusAccess for consistency
    const isPlus = isPlusTier || isVtPlus;

    let finalPlanSlug: PlanSlug;
    // Ensure rawPlanSlug is a valid PlanSlug key or default
    if (rawPlanSlug && Object.values(PlanSlug).includes(rawPlanSlug as PlanSlug)) {
        finalPlanSlug = rawPlanSlug as PlanSlug;
    } else {
        finalPlanSlug = isPlus ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE;
    }
    const planName = PLANS[finalPlanSlug].name;

    // Handle upgrade click
    const handleUpgradeClick = () => {
        if (onUpgradeClick) {
            onUpgradeClick();
        } else {
            // Default behavior: navigate to upgrade page
            window.location.href = '/plus';
        }
    };

    // Show upgrade prompt for free tier users with minimal shadcn styling
    if (!isPlus && showUpgradePrompt) {
        return (
            <div
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm',
                    'border-border bg-card text-muted-foreground',
                    'hover:bg-accent/50 shadow-sm transition-colors duration-200',
                    className
                )}
            >
                <span className="text-xs font-medium">Free</span>
                <div className="bg-muted-foreground/40 h-1 w-1 rounded-full" />
                <button
                    className="text-foreground hover:text-muted-foreground text-xs font-medium transition-colors duration-150"
                    onClick={handleUpgradeClick}
                >
                    Upgrade
                </button>
            </div>
        );
    }

    return (
        <Badge
            className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300',
                'border-border bg-muted text-foreground',
                className
            )}
            variant="outline"
        >
            {planName}
        </Badge>
    );
}

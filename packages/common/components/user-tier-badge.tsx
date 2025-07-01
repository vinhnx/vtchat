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
 * Displays the current user's subscription tier with appropriate styling:
 * - Plus tier: primary background #BFB38F, text color #262626, with check icon
 * - Free tier: zinc-700 background, white text, no icon
 *
 * Uses optimized subscription hooks for real-time subscription checking.
 * The component is highly optimized to minimize re-renders and provides
 * clear visual distinction between plan tiers.
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
                    'bg-card border-border text-muted-foreground',
                    'hover:bg-accent/50 shadow-sm transition-colors duration-200',
                    className
                )}
            >
                <span className="text-xs font-medium">Free</span>
                <div className="bg-muted-foreground/40 h-1 w-1 rounded-full" />
                <button
                    onClick={handleUpgradeClick}
                    className="text-primary hover:text-primary/80 text-xs font-medium transition-colors duration-150"
                >
                    Upgrade
                </button>
            </div>
        );
    }

    return (
        <Badge
            variant="secondary"
            className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300',
                isPlus
                    ? 'vt-plus-glass text-[#D99A4E] border-[#D99A4E]/30 shadow-lg'
                    : 'bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted/80',
                className
            )}
        >
            {planName}
        </Badge>
    );
}

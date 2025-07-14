"use client";

import { useVtPlusAccess } from "@repo/common/hooks/use-subscription-access";
import { PLANS, PlanSlug } from "@repo/shared/types/subscription";
import { Badge, cn } from "@repo/ui";

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


    // Use isPlusTier which now correctly checks both isVtPlus && isActive
    const isPlus = isPlusTier;

    // Use isPlus (which checks active status) to determine display, not rawPlanSlug
    const finalPlanSlug: PlanSlug = isPlus ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE;
    const planName = PLANS[finalPlanSlug].name;

    // Handle upgrade click
    const handleUpgradeClick = () => {
        if (onUpgradeClick) {
            onUpgradeClick();
        } else {
            // Default behavior: navigate to upgrade page
            window.location.href = "/plus";
        }
    };

    // Show upgrade prompt for free tier users with minimal shadcn styling
    if (!isPlus && showUpgradePrompt) {
        return (
            <div
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
                    "border-border bg-card text-muted-foreground",
                    "hover:bg-accent/50 shadow-sm transition-colors duration-200",
                    className,
                )}
            >
                <span className="text-xs font-medium">Free</span>
                <div className="bg-muted-foreground/40 h-1 w-1 rounded-full" />
                <button
                    type="button"
                    className="text-primary hover:text-primary/80 text-xs font-medium transition-colors duration-150"
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
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300",
                isPlus
                    ? "vt-plus-glass border-[#D99A4E]/30 text-[#D99A4E] shadow-lg"
                    : "border-muted-foreground/20 bg-muted text-muted-foreground hover:bg-muted/80",
                className,
            )}
            variant="secondary"
        >
            {planName}
        </Badge>
    );
}

'use client';

import { Badge, cn } from '@repo/ui';

interface UserTierBadgeProps {
    className?: string;
    showUpgradePrompt?: boolean;
    onUpgradeClick?: () => void;
}

/**
 * UserTierBadge Component
 *
 * Displays a neutral availability badge now that premium tiers are removed.
 */

export function UserTierBadge({
    className,
    showUpgradePrompt = false,
    onUpgradeClick,
}: UserTierBadgeProps) {
    void onUpgradeClick;
    void showUpgradePrompt;
    const planName = 'Free';

    return (
        <Badge
            className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300',
                'border-muted-foreground/20 bg-muted text-muted-foreground hover:bg-muted/80',
                className,
            )}
            variant='secondary'
        >
            {planName}
        </Badge>
    );
}

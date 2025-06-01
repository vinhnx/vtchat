'use client';

import { useCurrentPlan, useVtPlusAccess } from '@repo/common/hooks/use-subscription-access';
import { Badge, cn } from '@repo/ui';
import { Sparkle } from 'lucide-react';

interface UserTierBadgeProps {
    className?: string;
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

export function UserTierBadge({ className }: UserTierBadgeProps) {
    const isPlusTier = useVtPlusAccess();
    const { planInfo } = useCurrentPlan();

    if (!planInfo) {
        return (
            <Badge
                variant="secondary"
                className={cn('animate-pulse bg-zinc-700 text-white', className)}
                size="sm"
            >
                ...
            </Badge>
        );
    }

    return (
        <Badge
            variant="secondary"
            className={cn(
                'flex items-center gap-1 transition-colors duration-200',
                isPlusTier
                    ? 'bg-[#BFB38F] text-[#262626] hover:bg-[#BFB38F]/90'
                    : 'bg-zinc-700 text-white hover:bg-zinc-900',
                className
            )}
            size="sm"
        >
            {isPlusTier && <Sparkle size={12} strokeWidth={2} />}
            {planInfo.name}
        </Badge>
    );
}

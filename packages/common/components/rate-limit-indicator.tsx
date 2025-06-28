'use client';

import { useRateLimit } from '@repo/common/hooks';
import { ModelEnum } from '@repo/ai/models';
import { cn } from '@repo/ui';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RateLimitIndicatorProps {
    modelId: ModelEnum;
    className?: string;
    compact?: boolean;
}

export function RateLimitIndicator({ modelId, className, compact = false }: RateLimitIndicatorProps) {
    const { status, isLoading } = useRateLimit(modelId);

    // Only show for rate-limited models
    if (modelId !== ModelEnum.GEMINI_2_5_FLASH_LITE || !status) {
        return null;
    }

    if (isLoading) {
        return (
            <div className={cn('animate-pulse text-xs text-muted-foreground', className)}>
                Loading...
            </div>
        );
    }

    const isNearDailyLimit = status.remainingDaily <= 2;
    const isNearMinuteLimit = status.remainingMinute <= 0;

    if (compact) {
        return (
            <div className={cn('flex items-center gap-1 text-xs text-muted-foreground', className)}>
                {isNearDailyLimit || isNearMinuteLimit ? (
                    <AlertTriangle size={12} className="text-amber-500" />
                ) : (
                    <Clock size={12} />
                )}
                <span>
                    {status.remainingDaily}/{status.dailyLimit} today
                </span>
            </div>
        );
    }

    return (
        <div className={cn('space-y-1 text-xs', className)}>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Daily usage:</span>
                <span className={cn(
                    'font-medium',
                    isNearDailyLimit ? 'text-amber-600' : 'text-green-600'
                )}>
                    {status.remainingDaily}/{status.dailyLimit}
                </span>
            </div>
            
            {isNearMinuteLimit && (
                <div className="flex items-center gap-1 text-amber-600">
                    <Clock size={12} />
                    <span>Rate limited • Resets {formatDistanceToNow(status.resetTime.minute, { addSuffix: true })}</span>
                </div>
            )}
            
            {isNearDailyLimit && !isNearMinuteLimit && (
                <div className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle size={12} />
                    <span>Daily limit almost reached</span>
                </div>
            )}
        </div>
    );
}

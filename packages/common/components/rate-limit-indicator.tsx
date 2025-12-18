'use client';

import { ModelEnum } from '@repo/ai/models';
import { useRateLimit } from '@repo/common/hooks';
import { getFormatDistanceToNow } from '@repo/shared/utils';
import { cn } from '@repo/ui';
import { AlertTriangle, Clock } from 'lucide-react';

interface RateLimitIndicatorProps {
    modelId: ModelEnum;
    className?: string;
    compact?: boolean;
}

export function RateLimitIndicator({
    modelId,
    className,
    compact = false,
}: RateLimitIndicatorProps) {
    const { status, isLoading } = useRateLimit(modelId);

    // Only show for rate-limited models
    if (modelId !== ModelEnum.GEMINI_3_FLASH_LITE || !status) {
        return null;
    }

    if (isLoading) {
        return (
            <div className={cn('text-muted-foreground animate-pulse text-xs', className)}>
                Loading...
            </div>
        );
    }

    const isNearDailyLimit = status.remainingDaily <= 2;
    const isNearMinuteLimit = status.remainingMinute <= 0;

    if (compact) {
        return (
            <div className={cn('text-muted-foreground flex items-center gap-1 text-xs', className)}>
                {isNearDailyLimit || isNearMinuteLimit
                    ? <AlertTriangle className='text-amber-500' size={12} />
                    : <Clock size={12} />}
                <span>
                    {status.remainingDaily}/{status.dailyLimit} today
                </span>
            </div>
        );
    }

    return (
        <div className={cn('space-y-1 text-xs', className)}>
            <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Daily usage:</span>
                <span
                    className={cn(
                        'font-medium',
                        isNearDailyLimit ? 'text-amber-600' : 'text-green-600',
                    )}
                >
                    {status.remainingDaily}/{status.dailyLimit}
                </span>
            </div>

            {isNearMinuteLimit && (
                <div className='flex items-center gap-1 text-amber-600'>
                    <Clock size={12} />
                    <span>
                        Rate limited • Resets{' '}
                        {getFormatDistanceToNow(status.resetTime.minute, { addSuffix: true })}
                    </span>
                </div>
            )}

            {isNearDailyLimit && !isNearMinuteLimit && (
                <div className='flex items-center gap-1 text-amber-600'>
                    <AlertTriangle size={12} />
                    <span>Daily limit almost reached</span>
                </div>
            )}
        </div>
    );
}

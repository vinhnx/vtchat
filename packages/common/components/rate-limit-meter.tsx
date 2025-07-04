'use client';

import { ModelEnum } from '@repo/ai/models';
import { useRateLimit } from '@repo/common/hooks';
import { useSession } from '@repo/shared/lib/auth-client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Progress,
    Skeleton,
} from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function RateLimitMeter() {
    const { data: session } = useSession();
    const { status, isLoading, error } = useRateLimit(ModelEnum.GEMINI_2_5_FLASH_LITE);

    // Only show for authenticated users
    if (!session?.user?.id) {
        return null;
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="text-amber-500" size={16} />
                        Free Model Usage
                    </CardTitle>
                    <CardDescription>
                        Unable to load your personal usage information
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (isLoading || !status) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Clock size={16} />
                        Free Model Usage
                    </CardTitle>
                    <CardDescription>
                        Track your personal daily and per-minute limits for Gemini 2.5 Flash Lite
                        Preview
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const dailyUsagePercent = (status.dailyUsed / status.dailyLimit) * 100;
    const isNearDailyLimit = status.remainingDaily <= 2;
    const isAtMinuteLimit = status.remainingMinute <= 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                    {isAtMinuteLimit ? (
                        <AlertTriangle className="text-amber-500" size={16} />
                    ) : isNearDailyLimit ? (
                        <AlertTriangle className="text-amber-500" size={16} />
                    ) : (
                        <CheckCircle className="text-green-500" size={16} />
                    )}
                    Free Model Usage
                </CardTitle>
                <CardDescription>
                    Track your personal daily and per-minute limits for Gemini 2.5 Flash Lite
                    Preview
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Daily Usage */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Daily requests</span>
                            <span
                                className={
                                    isNearDailyLimit
                                        ? 'font-medium text-amber-600'
                                        : 'text-foreground'
                                }
                            >
                                {status.dailyUsed} / {status.dailyLimit}
                            </span>
                        </div>
                        <Progress
                            className="h-2"
                            indicatorClassName={
                                dailyUsagePercent >= 80
                                    ? 'bg-amber-500'
                                    : dailyUsagePercent >= 60
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                            }
                            value={dailyUsagePercent}
                        />
                        <div className="text-muted-foreground text-xs">
                            {status.remainingDaily} requests remaining • Resets{' '}
                            {formatDistanceToNow(status.resetTime.daily, { addSuffix: true })}
                        </div>
                    </div>

                    {/* Per-minute Status */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Per-minute rate limit</span>
                            <span
                                className={
                                    isAtMinuteLimit
                                        ? 'font-medium text-amber-600'
                                        : 'text-green-600'
                                }
                            >
                                {isAtMinuteLimit ? 'Rate limited' : 'Available'}
                            </span>
                        </div>
                        {isAtMinuteLimit && (
                            <div className="flex items-center gap-2 text-xs text-amber-600">
                                <Clock size={12} />
                                <span>
                                    Next request available{' '}
                                    {formatDistanceToNow(status.resetTime.minute, {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Status Messages */}
                    {status.remainingDaily === 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/50">
                            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                                <AlertTriangle size={16} />
                                <span className="font-medium">Daily limit reached</span>
                            </div>
                            <div className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                                Upgrade to VT+ for unlimited access to all models.
                            </div>
                        </div>
                    )}

                    {status.remainingDaily <= 2 && status.remainingDaily > 0 && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/50">
                            <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                                <AlertTriangle size={16} />
                                <span className="font-medium">Low on daily requests</span>
                            </div>
                            <div className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                                Consider upgrading to VT+ for unlimited access.
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

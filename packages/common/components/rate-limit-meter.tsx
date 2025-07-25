"use client";

import { ModelEnum } from "@repo/ai/models";
import { useRateLimit } from "@repo/common/hooks";
import { useSession } from "@repo/shared/lib/auth-client";
import { getFormatDistanceToNow } from "@repo/shared/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Progress,
    Skeleton,
} from "@repo/ui";

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
                    <CardTitle className="text-foreground">Free Model Usage</CardTitle>
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
                    <CardTitle className="text-foreground">Free Model Usage</CardTitle>
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
    const isAtMinuteLimit = status.remainingMinute <= 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-foreground">Free Model Usage</CardTitle>
                <CardDescription>
                    Track your personal daily and per-minute limits for Gemini 2.5 Flash Lite
                    Preview
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Daily Usage */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Daily requests</span>
                            <span className="text-foreground font-medium">
                                {status.dailyUsed} / {status.dailyLimit}
                            </span>
                        </div>
                        <Progress
                            className="bg-muted h-2"
                            indicatorClassName="bg-foreground"
                            value={dailyUsagePercent}
                        />
                        <div className="text-muted-foreground text-xs">
                            {status.remainingDaily} requests remaining • Resets{" "}
                            {getFormatDistanceToNow(status.resetTime.daily, { addSuffix: true })}
                        </div>
                    </div>

                    {/* Per-minute Status */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Per-minute rate limit</span>
                            <span className="text-foreground font-medium">
                                {isAtMinuteLimit ? "Rate limited" : "Available"}
                            </span>
                        </div>
                        {isAtMinuteLimit && (
                            <div className="text-muted-foreground text-xs">
                                Next request available{" "}
                                {getFormatDistanceToNow(status.resetTime.minute, {
                                    addSuffix: true,
                                })}
                            </div>
                        )}
                    </div>

                    {/* Status Messages */}
                    {status.remainingDaily === 0 && (
                        <div className="border-border bg-muted/20 rounded-lg border p-4">
                            <div className="text-foreground text-sm font-medium">
                                Daily limit reached
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                                Upgrade to VT+ for unlimited access to all models.
                            </div>
                        </div>
                    )}

                    {status.remainingDaily <= 2 && status.remainingDaily > 0 && (
                        <div className="border-border bg-muted/20 rounded-lg border p-4">
                            <div className="text-foreground text-sm font-medium">
                                Low on daily requests
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                                Consider upgrading to VT+ for unlimited access.
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

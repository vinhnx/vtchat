'use client';

import { ModelEnum } from '@repo/ai/models';
import { GEMINI_FLASH_LIMITS, limitText } from '@repo/shared/constants/rate-limits';
import { API_KEY_NAMES } from '@repo/shared/constants/api-keys';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    cn,
    TypographyH3,
    TypographyMuted,
} from '@repo/ui';
import {
    ArrowRight,
    Clock,
    Key,
    RefreshCw,
    Sparkle,
    Sparkles,
    Star,
    TrendingUp,
    Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useVtPlusAccess } from '../hooks/use-subscription-access';
import { useApiKeysStore } from '../store/api-keys.store';

// Circular Progress Component
interface CircleProgressProps {
    value: number;
    maxValue: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

function CircleProgress({
    value,
    maxValue,
    size = 60,
    strokeWidth = 4,
    className,
}: CircleProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const fillPercentage = Math.min(value / maxValue, 1);
    const strokeDashoffset = circumference * (1 - fillPercentage);

    const getColor = (percentage: number) => {
        if (percentage >= 1.0) return '#BF4545'; // Red for 100% usage
        if (percentage < 0.7) return '#10b981'; // Green
        if (percentage < 0.9) return '#3b82f6'; // Blue
        return '#8b5cf6'; // Purple
    };

    return (
        <div className={cn('relative', className)}>
            <svg
                className="-rotate-90 transform"
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                width={size}
            >
                <circle
                    className="stroke-muted fill-transparent"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <circle
                    className="fill-transparent transition-all duration-300"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getColor(fillPercentage)}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth={strokeWidth}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium">{Math.round(fillPercentage * 100)}%</span>
            </div>
        </div>
    );
}

// API Response Interface
interface RateLimitStatus {
    dailyUsed: number;
    minuteUsed: number;
    dailyLimit: number;
    minuteLimit: number;
    remainingDaily: number;
    remainingMinute: number;
    resetTime: {
        daily: string; // ISO string from Date
        minute: string; // ISO string from Date
    };
}

interface RateLimitUsageMeterProps {
    userId?: string;
    className?: string;
}

export default function RateLimitUsageMeter({ userId, className }: RateLimitUsageMeterProps) {
    const [status, setStatus] = useState<RateLimitStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeUntilReset, setTimeUntilReset] = useState('');

    // Detect VT+ subscription and BYOK API keys
    const isVtPlus = useVtPlusAccess();
    const apiKeys = useApiKeysStore((state) => state.getAllKeys());
    const hasGeminiApiKey = !!(
        apiKeys[API_KEY_NAMES.GOOGLE] && apiKeys[API_KEY_NAMES.GOOGLE].trim() !== ''
    );

    // Determine unlimited access status - BYOK takes priority over VT+
    const hasUnlimitedAccess = hasGeminiApiKey || isVtPlus;
    const unlimitedAccessType = hasGeminiApiKey ? 'byok' : 'vt_plus';

    const fetchUsage = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `/api/rate-limit/status?model=${ModelEnum.GEMINI_2_5_FLASH_LITE}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch usage data');
            }
            const data = await response.json();
            setStatus(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load usage data');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    // Update timer for daily reset
    useEffect(() => {
        if (!status) return;

        const updateTimer = () => {
            const resetTime = new Date(status.resetTime.daily);
            const now = new Date();
            const diff = resetTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeUntilReset('Reset available');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [status]);

    if (!userId) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="text-muted-foreground h-5 w-5" />
                        Usage Overview
                    </CardTitle>
                    <CardDescription>
                        Sign in to track your VT usage and explore upgrade options
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="text-muted-foreground h-5 w-5" />
                        Usage Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="min-h-[300px] min-w-[400px] space-y-6">
                        {/* Usage stats skeleton */}
                        <div className="space-y-4">
                            <div className="animate-pulse">
                                <div className="mb-2 h-5 w-48 rounded bg-gray-200" />
                                <div className="h-3 w-full rounded bg-gray-200" />
                            </div>
                            <div className="animate-pulse">
                                <div className="mb-2 h-5 w-40 rounded bg-gray-200" />
                                <div className="h-3 w-full rounded bg-gray-200" />
                            </div>
                        </div>

                        {/* Progress circles skeleton */}
                        <div className="flex justify-around space-x-4">
                            <div className="flex flex-col items-center space-y-2">
                                <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
                                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                                <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
                                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                            </div>
                        </div>

                        {/* Additional content skeleton */}
                        <div className="space-y-3">
                            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="text-muted-foreground h-5 w-5" />
                        Usage Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-4 text-center">
                        <p className="mb-3 text-sm text-gray-500">{error}</p>
                        <Button
                            className="flex items-center gap-2"
                            onClick={fetchUsage}
                            size="sm"
                            variant="outline"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!status) {
        return null;
    }

    const dailyPercentage = (status.dailyUsed / status.dailyLimit) * 100;
    const perMinutePercentage =
        status.remainingDaily <= 0 ? 100 : (status.minuteUsed / status.minuteLimit) * 100;

    const getDailyStatus = () => {
        if (dailyPercentage >= 80)
            return { variant: 'secondary' as const, text: 'Busy', icon: TrendingUp };
        if (dailyPercentage >= 50)
            return { variant: 'secondary' as const, text: 'Popular', icon: Zap };
        return { variant: 'secondary' as const, text: 'Active', icon: Star };
    };

    const getPerMinuteStatus = () => {
        // If daily limit is exhausted, show unavailable regardless of minute status
        if (status.remainingDaily <= 0)
            return {
                variant: 'secondary' as const,
                text: 'Unavailable',
                icon: TrendingUp,
            };
        if (perMinutePercentage >= 70)
            return { variant: 'secondary' as const, text: 'Busy', icon: TrendingUp };
        if (perMinutePercentage >= 40)
            return { variant: 'secondary' as const, text: 'Active', icon: Zap };
        return { variant: 'secondary' as const, text: 'Available', icon: Star };
    };

    const dailyStatus = getDailyStatus();
    const perMinuteStatus = getPerMinuteStatus();

    // Overlay Component for Unlimited Access
    const UnlimitedAccessOverlay = () => (
        <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm">
            <div className="space-y-4 p-6 text-center">
                <div className="flex items-center justify-center space-x-2">
                    {unlimitedAccessType === 'byok' ? (
                        <>
                            <Key className="text-muted-foreground h-8 w-8" />
                            <Badge className="px-4 py-2 text-lg font-semibold" variant="outline">
                                Using Your API Key
                            </Badge>
                        </>
                    ) : (
                        <>
                            <Sparkle className="text-muted-foreground h-8 w-8" />
                            <Badge
                                className="bg-[#BFB38F]/20 px-1.5 py-0.5 text-[10px] text-[#D99A4E]"
                                variant="secondary"
                            >
                                VT+ Active
                            </Badge>
                        </>
                    )}
                </div>
                <div className="space-y-2">
                    <p className="text-foreground text-lg font-medium">
                        {unlimitedAccessType === 'byok'
                            ? 'No Usage Restrictions'
                            : 'Unlimited Usage'}
                    </p>
                    <p className="text-muted-foreground max-w-md text-sm">
                        {unlimitedAccessType === 'byok'
                            ? 'You are using your own Gemini API key. Usage limits do not apply to your account.'
                            : `Your VT+ subscription provides unlimited access to all features. For Gemini 2.5 Flash Lite, you get enhanced limits (${limitText.plus()}) with our free offering. Set up your own Gemini API key for unlimited usage.`}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className={cn('w-full space-y-6', className)}>
            {/* Header */}
            <div>
                <TypographyH3>Usage Overview</TypographyH3>
                <TypographyMuted>Track your VT usage and explore upgrade options</TypographyMuted>
            </div>

            {/* Main Stats Grid */}
            <div
                className={cn(
                    'relative grid grid-cols-1 gap-4 md:grid-cols-2',
                    hasUnlimitedAccess && 'opacity-50'
                )}
            >
                {hasUnlimitedAccess && <UnlimitedAccessOverlay />}
                {/* Daily Limit Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="text-muted-foreground h-5 w-5" />
                                Daily Usage
                            </CardTitle>
                            <Badge variant={dailyStatus.variant}>
                                <dailyStatus.icon className="mr-1 h-3 w-3" />
                                {dailyStatus.text}
                            </Badge>
                        </div>
                        <CardDescription>You're making great use of VT today!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-foreground text-3xl font-bold">
                                        {status.dailyUsed}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        of {status.dailyLimit} requests
                                    </div>
                                </div>
                                <CircleProgress
                                    maxValue={status.dailyLimit}
                                    size={80}
                                    value={status.dailyUsed}
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-blue-600">
                                    {dailyPercentage.toFixed(1)}% used
                                </span>
                                <span
                                    className={`font-medium ${status.remainingDaily === 0 ? 'text-[#BF4545]' : 'text-green-600'}`}
                                >
                                    {status.remainingDaily} remaining
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Per-Minute Limit Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="text-muted-foreground h-5 w-5" />
                                Current Activity
                            </CardTitle>
                            <Badge variant={perMinuteStatus.variant}>
                                <perMinuteStatus.icon className="mr-1 h-3 w-3" />
                                {perMinuteStatus.text}
                            </Badge>
                        </div>
                        <CardDescription>Real-time usage activity level</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-foreground text-3xl font-bold">
                                        {status.minuteUsed}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        of {status.minuteLimit} req/min
                                    </div>
                                </div>
                                <CircleProgress
                                    maxValue={status.minuteLimit}
                                    size={80}
                                    value={
                                        status.remainingDaily <= 0
                                            ? status.minuteLimit
                                            : status.minuteUsed
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">
                                    {perMinutePercentage.toFixed(1)}% used
                                </span>
                                <span
                                    className={`font-medium ${status.remainingDaily <= 0 || status.remainingMinute === 0 ? 'text-[#BF4545]' : 'text-muted-foreground'}`}
                                >
                                    {status.remainingDaily <= 0 ? 0 : status.remainingMinute}{' '}
                                    available
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reset Timer Card */}
            <div className={cn('relative', hasUnlimitedAccess && 'opacity-50')}>
                {hasUnlimitedAccess && (
                    <div className="bg-background/60 absolute inset-0 z-10 rounded-lg backdrop-blur-sm" />
                )}
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-muted rounded-lg p-2">
                                    <Clock className="text-muted-foreground h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-foreground font-semibold">
                                        Daily Refresh
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        Your daily quota refreshes in
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-foreground font-mono text-2xl font-bold">
                                    {timeUntilReset}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    {new Date(status.resetTime.daily).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* VT+ Gemini API Key CTA - Only show if user has VT+ but no Gemini API key */}
            {isVtPlus &&
                !hasGeminiApiKey &&
                (dailyPercentage >= 60 || perMinutePercentage >= 50) && (
                    <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:border-yellow-800 dark:from-yellow-950 dark:to-orange-950">
                        <CardContent className="py-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                                        Get Unlimited Gemini Usage
                                    </div>
                                    <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                        {`You're hitting your VT+ enhanced limits (${GEMINI_FLASH_LIMITS.PLUS_DAY}/day, ${GEMINI_FLASH_LIMITS.PLUS_MINUTE}/minute)
                                        for free Gemini 2.5 Flash Lite. Set up your own Gemini API
                                        key for unlimited usage and access to all Gemini models.`}
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                                            <Key className="h-3 w-3" />
                                            Free API key
                                        </div>
                                        <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                                            <Zap className="h-3 w-3" />
                                            Unlimited usage
                                        </div>
                                        <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                                            <Sparkles className="h-3 w-3" />
                                            Premium models
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    className="group gap-2"
                                    onClick={() =>
                                        window.open(
                                            'https://aistudio.google.com/app/apikey',
                                            '_blank'
                                        )
                                    }
                                    variant="outline"
                                >
                                    <Key className="h-4 w-4" />
                                    Get API Key
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

            {/* VT+ Upgrade CTA - Only show if user doesn't have unlimited access */}
            {!hasUnlimitedAccess &&
                !isVtPlus &&
                (dailyPercentage >= 60 || perMinutePercentage >= 50) && (
                    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-950 dark:to-purple-950">
                        <CardContent className="py-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                        Upgrade to VT+ for More
                                    </div>
                                    <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                        Get unlimited usage, priority support, and access to the
                                        latest AI models.
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                                            <Star className="h-3 w-3" />
                                            Higher daily limits
                                        </div>
                                        <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                                            <Zap className="h-3 w-3" />
                                            Priority processing
                                        </div>
                                        <div className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                                            <TrendingUp className="h-3 w-3" />
                                            Advanced models
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    className="group gap-2"
                                    onClick={() => (window.location.href = '/plus')}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Upgrade to VT+
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

            {/* Refresh Button */}
            <div className={cn('flex justify-center', hasUnlimitedAccess && 'opacity-50')}>
                <Button
                    className="flex items-center gap-2 text-xs"
                    disabled={hasUnlimitedAccess}
                    onClick={fetchUsage}
                    size="sm"
                    variant="ghost"
                >
                    <RefreshCw className="h-3 w-3" />
                    Refresh Usage
                </Button>
            </div>
        </div>
    );
}

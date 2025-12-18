'use client';

import { ModelEnum } from '@repo/ai/models';
import { API_KEY_NAMES } from '@repo/shared/constants/api-keys';
import { GEMINI_LIMITS } from '@repo/shared/constants/rate-limits';
import { PlanSlug } from '@repo/shared/types/subscription';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    cn,
    Progress,
    TypographyH3,
    TypographyMuted,
} from '@repo/ui';
import { useCallback, useEffect, useState } from 'react';
import { useVtPlusAccess } from '../hooks/use-subscription-access';
import { useApiKeysStore } from '../store/api-keys.store';

// Model configuration for display
const MODEL_CONFIG = {
    [ModelEnum.GEMINI_2_5_FLASH_LITE]: {
        name: 'Gemini 2.5 Flash Lite',
        description: 'Fast and efficient',
        limits: GEMINI_LIMITS.FLASH_LITE,
    },
    [ModelEnum.GEMINI_2_5_FLASH]: {
        name: 'Gemini 2.5 Flash',
        description: 'Fast performance',
        limits: GEMINI_LIMITS.FLASH,
    },
    [ModelEnum.GEMINI_2_5_PRO]: {
        name: 'Gemini 2.5 Pro',
        description: 'Most capable',
        limits: GEMINI_LIMITS.PRO,
    },
    [ModelEnum.GEMINI_3_FLASH]: {
        name: 'Gemini 3 Flash',
        description: 'Most intelligent and fast',
        limits: GEMINI_LIMITS.FLASH_3,
    },
} as const;

// API Response Interfaces
interface RateLimitStatus {
    dailyUsed: number;
    minuteUsed: number;
    dailyLimit: number;
    minuteLimit: number;
    remainingDaily: number;
    remainingMinute: number;
    resetTime: {
        daily: string;
        minute: string;
    };
}

type GeminiModelId =
    | ModelEnum.GEMINI_2_5_FLASH_LITE
    | ModelEnum.GEMINI_2_5_FLASH
    | ModelEnum.GEMINI_2_5_PRO
    | ModelEnum.GEMINI_3_FLASH;

interface RateLimitUsageMeterProps {
    userId?: string;
    className?: string;
    modelId?: GeminiModelId;
}

export default function RateLimitUsageMeter({
    userId,
    className,
    modelId = ModelEnum.GEMINI_2_5_FLASH_LITE,
}: RateLimitUsageMeterProps) {
    const [status, setStatus] = useState<RateLimitStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Detect VT+ subscription and BYOK API keys
    const isVtPlus = useVtPlusAccess();
    const apiKeys = useApiKeysStore((state) => state.getAllKeys());
    const hasGeminiApiKey = !!(
        apiKeys[API_KEY_NAMES.GOOGLE] && apiKeys[API_KEY_NAMES.GOOGLE].trim() !== ''
    );

    // Determine enhanced access status (BYOK = unlimited, VT+ = higher limits)
    const hasEnhancedAccess = hasGeminiApiKey || isVtPlus;
    const accessType = hasGeminiApiKey ? 'byok' : PlanSlug.VT_PLUS;

    const fetchUsage = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`/api/rate-limit/status?model=${modelId}`);
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
                setError(null);
            } else {
                throw new Error('Failed to fetch rate limit status');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load usage data');
        } finally {
            setLoading(false);
        }
    }, [userId, modelId]);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    if (!userId) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className='text-foreground'>Rate Limit Overview</CardTitle>
                    <CardDescription>
                        Sign in to track your Gemini Flash Lite usage limits
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className='text-foreground'>Rate Limit Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='bg-muted h-4 w-32 animate-pulse rounded' />
                        <div className='bg-muted h-16 w-full animate-pulse rounded' />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !status) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className='text-foreground'>Rate Limit Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='py-8 text-center'>
                        <p className='text-muted-foreground mb-4 text-sm'>
                            {error || 'Unable to load rate limit data'}
                        </p>
                        <Button onClick={fetchUsage} size='sm' variant='outline'>
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const config = MODEL_CONFIG[modelId];
    const isVtPlusUser = isVtPlus;
    const dailyLimit = isVtPlusUser ? config.limits.PLUS_DAY : config.limits.FREE_DAY;
    const dailyPercentage = (status.dailyUsed / dailyLimit) * 100;

    return (
        <div className={cn('w-full space-y-6', className)}>
            {/* Header */}
            <div>
                <TypographyH3>Rate Limit Overview</TypographyH3>
                <TypographyMuted>
                    Track your Gemini Flash Lite usage.{' '}
                    {isVtPlusUser ? 'VT+ subscriber' : 'Free user'} limits apply.
                </TypographyMuted>
            </div>

            {/* Main Usage Card */}
            <Card className={cn(hasEnhancedAccess && 'relative opacity-60')}>
                {hasEnhancedAccess && (
                    <div className='bg-background/60 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm'>
                        <Badge variant='outline' className='bg-background text-foreground'>
                            {accessType === 'byok' ? 'Using Your API Key' : 'VT+ Higher Limits'}
                        </Badge>
                    </div>
                )}
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='text-foreground'>Gemini {config.name}</CardTitle>
                        <Badge
                            variant={status.remainingDaily === 0 ? 'secondary' : 'outline'}
                            className='text-foreground'
                        >
                            {status.remainingDaily === 0 ? 'Exhausted' : 'Available'}
                        </Badge>
                    </div>
                    <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-6'>
                        {/* Daily Usage */}
                        <div className='space-y-4'>
                            <div className='flex items-baseline justify-between'>
                                <div className='text-foreground text-2xl font-bold'>
                                    {status.dailyUsed}
                                </div>
                                <div className='text-muted-foreground text-sm'>
                                    of {dailyLimit} requests today
                                </div>
                            </div>
                            <Progress
                                className='bg-muted h-2'
                                indicatorClassName='bg-foreground'
                                value={dailyPercentage}
                            />
                            <div className='flex items-center justify-between text-sm'>
                                <span className='text-muted-foreground'>
                                    {dailyPercentage.toFixed(1)}% used
                                </span>
                                <span className='text-foreground font-medium'>
                                    {status.remainingDaily} remaining
                                </span>
                            </div>
                        </div>

                        {/* Per-minute Status */}
                        <div className='space-y-3'>
                            <div className='flex justify-between text-sm'>
                                <span className='text-muted-foreground'>Per-minute limit</span>
                                <span className='text-foreground font-medium'>
                                    {status.remainingMinute <= 0 ? 'Rate limited' : 'Available'}
                                </span>
                            </div>
                            {status.remainingMinute <= 0 && (
                                <div className='text-muted-foreground text-xs'>
                                    Next request available soon
                                </div>
                            )}
                        </div>

                        {/* Status Messages */}
                        {status.remainingDaily === 0 && (
                            <div className='border-border bg-muted/20 rounded-lg border p-4'>
                                <div className='text-foreground text-sm font-medium'>
                                    Daily limit reached
                                </div>
                                <div className='text-muted-foreground mt-1 text-xs'>
                                    {isVtPlusUser
                                        ? 'Limit will reset tomorrow.'
                                        : 'Upgrade to VT+ for higher limits or use your own API key.'}
                                </div>
                            </div>
                        )}

                        {status.remainingDaily <= 2
                            && status.remainingDaily > 0
                            && !isVtPlusUser && (
                            <div className='border-border bg-muted/20 rounded-lg border p-4'>
                                <div className='text-foreground text-sm font-medium'>
                                    Low on daily requests
                                </div>
                                <div className='text-muted-foreground mt-1 text-xs'>
                                    Consider upgrading to VT+ for higher limits.
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Refresh Button */}
            <div className='flex justify-center'>
                <Button
                    onClick={fetchUsage}
                    size='sm'
                    variant='ghost'
                    className='text-muted-foreground'
                >
                    Refresh Usage
                </Button>
            </div>
        </div>
    );
}

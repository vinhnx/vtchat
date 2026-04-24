'use client';

import { ModelEnum } from '@repo/ai/models';
import { API_KEY_NAMES } from '@repo/shared/constants/api-keys';
import { GEMINI_LIMITS } from '@repo/shared/constants/rate-limits';
import { http } from '@repo/shared/lib/http-client';
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
import { useApiKeysStore } from '../store/api-keys.store';

const MODEL_CONFIG = {
    [ModelEnum.GEMINI_3_FLASH_LITE]: {
        name: 'Gemini 3 Flash Lite',
        description: 'Fast and efficient',
        limits: GEMINI_LIMITS.FLASH_LITE,
    },
    [ModelEnum.GEMINI_3_FLASH]: {
        name: 'Gemini 3 Flash',
        description: 'Fast performance',
        limits: GEMINI_LIMITS.FLASH,
    },
    [ModelEnum.GEMINI_3_PRO]: {
        name: 'Gemini 3 Pro',
        description: 'Most capable',
        limits: GEMINI_LIMITS.PRO,
    },
} as const;

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
    | ModelEnum.GEMINI_3_FLASH_LITE
    | ModelEnum.GEMINI_3_FLASH
    | ModelEnum.GEMINI_3_PRO;

interface RateLimitUsageMeterProps {
    userId?: string;
    className?: string;
    modelId?: GeminiModelId;
}

export default function RateLimitUsageMeter({
    userId,
    className,
    modelId = ModelEnum.GEMINI_3_FLASH_LITE,
}: RateLimitUsageMeterProps) {
    const [status, setStatus] = useState<RateLimitStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const apiKeys = useApiKeysStore((state) => state.getAllKeys());
    const hasGeminiApiKey = !!(
        apiKeys[API_KEY_NAMES.GOOGLE] && apiKeys[API_KEY_NAMES.GOOGLE].trim() !== ''
    );

    const fetchUsage = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await http.get<RateLimitStatus>(`/api/rate-limit/status?model=${modelId}`);
            setStatus(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load usage data');
        } finally {
            setLoading(false);
        }
    }, [modelId, userId]);

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
    const dailyLimit = hasGeminiApiKey ? config.limits.PLUS_DAY : config.limits.FREE_DAY;
    const dailyPercentage = (status.dailyUsed / dailyLimit) * 100;

    return (
        <div className={cn('w-full space-y-6', className)}>
            <div>
                <TypographyH3>Rate Limit Overview</TypographyH3>
                <TypographyMuted>
                    Track your Gemini Flash Lite usage and request limits.
                </TypographyMuted>
            </div>

            <Card className='relative'>
                <CardHeader>
                    <div className='flex items-center justify-between gap-3'>
                        <div>
                            <CardTitle className='text-foreground'>Gemini {config.name}</CardTitle>
                            <CardDescription>{config.description}</CardDescription>
                        </div>
                        <Badge variant='outline' className='text-foreground'>
                            {hasGeminiApiKey ? 'Using Your API Key' : 'Managed Access'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='space-y-6'>
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

                        {status.remainingDaily === 0 && (
                            <div className='border-border bg-muted/20 rounded-lg border p-4'>
                                <div className='text-foreground text-sm font-medium'>
                                    Daily limit reached
                                </div>
                                <div className='text-muted-foreground mt-1 text-xs'>
                                    {hasGeminiApiKey
                                        ? 'Limit will reset tomorrow.'
                                        : 'Add your own Gemini API key for higher limits.'}
                                </div>
                            </div>
                        )}

                        {status.remainingDaily <= 2 && status.remainingDaily > 0 && (
                            <div className='border-border bg-muted/20 rounded-lg border p-4'>
                                <div className='text-foreground text-sm font-medium'>
                                    Low on daily requests
                                </div>
                                <div className='text-muted-foreground mt-1 text-xs'>
                                    Add your own Gemini API key if you want more headroom.
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className='flex justify-center'>
                <Button onClick={fetchUsage} size='sm' variant='ghost' className='text-muted-foreground'>
                    Refresh Usage
                </Button>
            </div>
        </div>
    );
}

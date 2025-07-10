'use client';

import { ModelEnum } from '@repo/ai/models';
import { GEMINI_LIMITS } from '@repo/shared/constants/rate-limits';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    cn,
    TypographyH3,
    TypographyMuted,
} from '@repo/ui';
import { useCallback, useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

// Model configuration for display
const MODEL_CONFIG = {
    [ModelEnum.GEMINI_2_5_FLASH_LITE]: {
        name: 'Gemini 2.5 Flash Lite',
        description: 'Fast and efficient',
        limits: GEMINI_LIMITS.FLASH_LITE,
    },
    [ModelEnum.GEMINI_2_5_FLASH]: {
        name: 'Gemini 2.5 Flash',
        description: 'Balanced performance',
        limits: GEMINI_LIMITS.FLASH,
    },
    [ModelEnum.GEMINI_2_5_PRO]: {
        name: 'Gemini 2.5 Pro',
        description: 'Advanced capabilities',
        limits: GEMINI_LIMITS.PRO,
    },
    [ModelEnum.GEMINI_2_0_FLASH]: {
        name: 'Gemini 2.0 Flash',
        description: 'Latest generation',
        limits: GEMINI_LIMITS.FLASH_2_0,
    },
    [ModelEnum.GEMINI_2_0_FLASH_LITE]: {
        name: 'Gemini 2.0 Flash Lite',
        description: 'Latest efficient',
        limits: GEMINI_LIMITS.FLASH_LITE_2_0,
    },
} as const;

// Models array constant to prevent re-renders
const MODELS = Object.keys(MODEL_CONFIG) as ModelEnum[];

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

interface MultiModelUsageMeterProps {
    userId?: string;
    className?: string;
}

export default function MultiModelUsageMeter({ userId, className }: MultiModelUsageMeterProps) {
    const [modelStatuses, setModelStatuses] = useState<Record<string, RateLimitStatus>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Note: VT+ users get enhanced limits and BYOK users get unlimited access

    const fetchUsage = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch rate limit status for all models in a single API call
            const response = await fetch('/api/rate-limit/status');

            if (!response.ok) {
                throw new Error(`Failed to fetch usage data: ${response.status}`);
            }

            const allStatuses = await response.json();

            // Filter and validate the response
            const statuses: Record<string, RateLimitStatus> = {};
            for (const model of MODELS) {
                if (allStatuses[model] && allStatuses[model] !== null) {
                    statuses[model] = allStatuses[model];
                }
            }

            setModelStatuses(statuses);
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

    if (!userId) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-foreground">Usage Overview</CardTitle>
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
                    <CardTitle className="text-foreground">Usage Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                                <div className="h-16 w-full rounded bg-muted animate-pulse" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-foreground">Usage Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center">
                        <p className="mb-4 text-sm text-muted-foreground">{error}</p>
                        <Button onClick={fetchUsage} size="sm" variant="outline">
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalRequestsToday = Object.values(modelStatuses).reduce(
        (sum, status) => sum + status.dailyUsed,
        0
    );

    return (
        <div className={cn('w-full space-y-6', className)}>
            {/* Header */}
            <div>
                <TypographyH3>Usage Overview</TypographyH3>
                <TypographyMuted>
                    Track your Gemini model usage. Server-funded access requires VT+ subscription.
                    Free users must provide their own API key.
                    <br />
                    <span className="text-xs text-muted-foreground/80">
                        Note: Usage is tracked for server-funded requests only. VT+ Flash Lite has unlimited access but usage is shown for transparency. BYOK usage is not counted.
                        <br />
                        <a
                            href="https://ai.google.dev/gemini-api/docs/models"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            View official Gemini model documentation →
                        </a>
                    </span>
                </TypographyMuted>
            </div>

            {/* Overall Usage Summary Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-foreground">Today's Usage Summary</CardTitle>
                    <CardDescription>
                        Stacked usage visualization across all Gemini models
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={{
                            'flash-lite-2-5': {
                                label: `${MODEL_CONFIG[ModelEnum.GEMINI_2_5_FLASH_LITE].name}`,
                                color: 'hsl(var(--chart-1))',
                            },
                            'flash-2-5': {
                                label: `${MODEL_CONFIG[ModelEnum.GEMINI_2_5_FLASH].name}`,
                                color: 'hsl(var(--chart-2))',
                            },
                            'pro-2-5': {
                                label: `${MODEL_CONFIG[ModelEnum.GEMINI_2_5_PRO].name}`,
                                color: 'hsl(var(--chart-3))',
                            },
                            'flash-2-0': {
                                label: `${MODEL_CONFIG[ModelEnum.GEMINI_2_0_FLASH].name}`,
                                color: 'hsl(var(--chart-4))',
                            },
                            'flash-lite-2-0': {
                                label: `${MODEL_CONFIG[ModelEnum.GEMINI_2_0_FLASH_LITE].name}`,
                                color: 'hsl(var(--chart-5))',
                            },
                        }}
                        className="min-h-[240px]"
                    >
                        <AreaChart
                            data={[
                                {
                                    time: '00:00',
                                    'flash-lite-2-5': 0,
                                    'flash-2-5': 0,
                                    'pro-2-5': 0,
                                    'flash-2-0': 0,
                                    'flash-lite-2-0': 0,
                                },
                                {
                                    time: 'Current',
                                    'flash-lite-2-5':
                                        modelStatuses[ModelEnum.GEMINI_2_5_FLASH_LITE]?.dailyUsed || 0,
                                    'flash-2-5':
                                        modelStatuses[ModelEnum.GEMINI_2_5_FLASH]?.dailyUsed || 0,
                                    'pro-2-5':
                                        modelStatuses[ModelEnum.GEMINI_2_5_PRO]?.dailyUsed || 0,
                                    'flash-2-0':
                                        modelStatuses[ModelEnum.GEMINI_2_0_FLASH]?.dailyUsed || 0,
                                    'flash-lite-2-0':
                                        modelStatuses[ModelEnum.GEMINI_2_0_FLASH_LITE]?.dailyUsed || 0,
                                },
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 45 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                opacity={0.3}
                            />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 12 }}
                                tickLine={{ stroke: 'hsl(var(--border))' }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={{ stroke: 'hsl(var(--border))' }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                                allowDecimals={false}
                                domain={[0, (dataMax: number) => Math.max(5, Math.ceil(dataMax * 1.2))]}
                                tickCount={6}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Area
                                type="monotone"
                                dataKey="flash-lite-2-5"
                                stackId="1"
                                stroke="var(--color-flash-lite-2-5)"
                                fill="var(--color-flash-lite-2-5)"
                                fillOpacity={0.8}
                            />
                            <Area
                                type="monotone"
                                dataKey="flash-2-5"
                                stackId="1"
                                stroke="var(--color-flash-2-5)"
                                fill="var(--color-flash-2-5)"
                                fillOpacity={0.8}
                            />
                            <Area
                                type="monotone"
                                dataKey="pro-2-5"
                                stackId="1"
                                stroke="var(--color-pro-2-5)"
                                fill="var(--color-pro-2-5)"
                                fillOpacity={0.8}
                            />
                            <Area
                                type="monotone"
                                dataKey="flash-2-0"
                                stackId="1"
                                stroke="var(--color-flash-2-0)"
                                fill="var(--color-flash-2-0)"
                                fillOpacity={0.8}
                            />
                            <Area
                                type="monotone"
                                dataKey="flash-lite-2-0"
                                stackId="1"
                                stroke="var(--color-flash-lite-2-0)"
                                fill="var(--color-flash-lite-2-0)"
                                fillOpacity={0.8}
                            />
                        </AreaChart>
                    </ChartContainer>

                    {/* Usage Statistics Grid */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                            <div className="text-2xl font-bold text-foreground">
                                {totalRequestsToday}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Total Requests Today
                            </div>
                        </div>
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                            <div className="text-2xl font-bold text-foreground">
                                {Object.values(modelStatuses).reduce(
                                    (sum, status) => sum + status.minuteUsed,
                                    0
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Requests This Minute
                            </div>
                        </div>
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                            <div className="text-2xl font-bold text-foreground">
                                {
                                    Object.keys(modelStatuses).filter(
                                        (model) => modelStatuses[model]?.dailyUsed > 0
                                    ).length
                                }
                            </div>
                            <div className="text-sm text-muted-foreground">Active Models</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage Limits & Policy Information */}
            <Card className="border-muted/50 bg-muted/10">
                <CardHeader>
                    <CardTitle className="text-foreground">Usage Limits & Policy</CardTitle>
                    <CardDescription>
                        Understanding VT's Gemini model access and rate limits
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Subscription Tiers Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* VT+ Subscription */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-chart-1" />
                                <div className="font-medium text-foreground">
                                    VT+ Subscription
                                </div>
                            </div>
                            <div className="p-4 bg-background/50 rounded-lg border border-chart-1/20">
                                <div className="text-sm text-muted-foreground space-y-2">
                                    <div className="font-medium text-foreground mb-3">Server-funded Access</div>
                                    <div>• <strong>Unlimited</strong> Gemini 2.5 Flash Lite access</div>
                                    <div>• Enhanced limits for all Gemini models</div>
                                    <div>• No API key required for Gemini models</div>
                                    <div>• Immediate access without setup</div>
                                    <div>• Priority support</div>
                                    <div>• 3 exclusive research features (Deep Research, Pro Search, AI Memory)</div>
                                </div>
                            </div>
                        </div>

                        {/* Free Tier */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-chart-2" />
                                <div className="font-medium text-foreground">
                                    Free Tier (Registered Users)
                                </div>
                            </div>
                            <div className="p-4 bg-background/50 rounded-lg border border-chart-2/20">
                                <div className="text-sm text-muted-foreground space-y-2">
                                    <div className="font-medium text-foreground mb-3">Limited Server Access + BYOK</div>
                                    <div>• Gemini 2.5 Flash Lite: <strong>{GEMINI_LIMITS.FLASH_LITE.FREE_DAY}/day</strong>, {GEMINI_LIMITS.FLASH_LITE.FREE_MINUTE}/min</div>
                                    <div>• Must provide own API key for other models</div>
                                    <div>• Unlimited usage with BYOK</div>
                                    <div>• All advanced features included</div>
                                    <div>• Local API key encryption</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rate Limits Breakdown */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-chart-3" />
                            <div className="font-medium text-foreground">
                                Server-funded Rate Limits
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <div className="p-3 bg-background/50 rounded-lg">
                                <div className="font-medium text-foreground mb-2 text-sm">
                                    Gemini 2.5 Flash Lite
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>VT+: <span className="font-medium">Unlimited</span> <span className="text-xs text-muted-foreground/70">(usage tracked)</span></div>
                                    <div>Free: <span className="font-medium">{GEMINI_LIMITS.FLASH_LITE.FREE_DAY}/day, {GEMINI_LIMITS.FLASH_LITE.FREE_MINUTE}/min</span></div>
                                </div>
                            </div>
                            <div className="p-3 bg-background/50 rounded-lg">
                                <div className="font-medium text-foreground mb-2 text-sm">
                                    Gemini 2.5 Flash
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>VT+: <span className="font-medium">{GEMINI_LIMITS.FLASH.PLUS_DAY}/day, {GEMINI_LIMITS.FLASH.PLUS_MINUTE}/min</span></div>
                                    <div>Free: <span className="font-medium">BYOK Required</span></div>
                                </div>
                            </div>
                            <div className="p-3 bg-background/50 rounded-lg">
                                <div className="font-medium text-foreground mb-2 text-sm">
                                    Gemini 2.5 Pro
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>VT+: <span className="font-medium">{GEMINI_LIMITS.PRO.PLUS_DAY}/day, {GEMINI_LIMITS.PRO.PLUS_MINUTE}/min</span></div>
                                    <div>Free: <span className="font-medium">BYOK Required</span></div>
                                </div>
                            </div>
                            <div className="p-3 bg-background/50 rounded-lg">
                                <div className="font-medium text-foreground mb-2 text-sm">
                                    Gemini 2.0 Flash
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>VT+: <span className="font-medium">{GEMINI_LIMITS.FLASH_2_0.PLUS_DAY}/day, {GEMINI_LIMITS.FLASH_2_0.PLUS_MINUTE}/min</span></div>
                                    <div>Free: <span className="font-medium">BYOK Required</span></div>
                                </div>
                            </div>
                            <div className="p-3 bg-background/50 rounded-lg">
                                <div className="font-medium text-foreground mb-2 text-sm">
                                    Gemini 2.0 Flash Lite
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>VT+: <span className="font-medium">Unlimited</span> <span className="text-xs text-muted-foreground/70">(usage tracked)</span></div>
                                    <div>Free: <span className="font-medium">{GEMINI_LIMITS.FLASH_LITE_2_0.FREE_DAY}/day, {GEMINI_LIMITS.FLASH_LITE_2_0.FREE_MINUTE}/min</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="space-y-3">
                        <div className="p-4 bg-muted/20 rounded-lg border border-muted">
                            <div className="flex items-start gap-2">
                                <div className="h-2 w-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                                <div className="text-sm">
                                    <div className="font-medium text-foreground mb-1">
                                        VT+ Usage Tracking
                                    </div>
                                    <div className="text-muted-foreground space-y-1">
                                        <div>• <strong>Flash Lite (2.5 & 2.0):</strong> Unlimited access with usage tracked for display purposes</div>
                                        <div>• <strong>Flash & Pro (2.5 & 2.0):</strong> Count against both model-specific limits AND Flash Lite quota (stricter limit applies)</div>
                                        <div>• <strong>All models:</strong> Usage is tracked and displayed in the chart for transparency</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/20 rounded-lg border border-muted">
                            <div className="flex items-start gap-2">
                                <div className="h-2 w-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                                <div className="text-sm">
                                    <div className="font-medium text-foreground mb-1">
                                        BYOK (Bring Your Own Key)
                                    </div>
                                    <div className="text-muted-foreground">
                                        Free users can access all Gemini models unlimited by providing their own Google API key. Keys are encrypted and stored locally.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/20 rounded-lg border border-muted">
                            <div className="flex items-start gap-2">
                                <div className="h-2 w-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                                <div className="text-sm">
                                    <div className="font-medium text-foreground mb-1">
                                        Google's Pricing Reference
                                    </div>
                                    <div className="text-muted-foreground">
                                        Flash Lite: $0.10/1M tokens • Flash: $0.30/1M tokens • Pro: $1.25/1M tokens (Input pricing)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Refresh Button */}
            <div className="flex justify-center">
                <Button
                    onClick={fetchUsage}
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Usage'}
                </Button>
            </div>
        </div>
    );
}

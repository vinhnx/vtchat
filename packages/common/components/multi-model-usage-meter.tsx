"use client";

import { ModelEnum } from "@repo/ai/models";
import { GEMINI_LIMITS } from "@repo/shared/constants/rate-limits";
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
} from "@repo/ui";
import { useCallback, useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { QUOTA_WINDOW } from "../src/config/vtPlusLimits";

// Model configuration for display
const MODEL_CONFIG = {
    [ModelEnum.GEMINI_2_5_FLASH_LITE]: {
        name: "Gemini 2.5 Flash Lite",
        description: "Fast and efficient",
        limits: GEMINI_LIMITS.FLASH_LITE,
    },
    [ModelEnum.GEMINI_2_5_FLASH]: {
        name: "Gemini 2.5 Flash",
        description: "Balanced performance",
        limits: GEMINI_LIMITS.FLASH,
    },
    [ModelEnum.GEMINI_2_5_PRO]: {
        name: "Gemini 2.5 Pro",
        description: "Advanced capabilities",
        limits: GEMINI_LIMITS.PRO,
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
            const response = await fetch("/api/rate-limit/status");

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
            setError(err instanceof Error ? err.message : "Failed to load usage data");
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
                                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                                <div className="bg-muted h-16 w-full animate-pulse rounded" />
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
                        <p className="text-muted-foreground mb-4 text-sm">{error}</p>
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
        0,
    );

    return (
        <div className={cn("w-full space-y-6", className)}>
            {/* Header */}
            <div>
                <TypographyH3 className="text-lg md:text-xl">Usage Overview</TypographyH3>
                <TypographyMuted className="text-sm md:text-base">
                    Track your Gemini model usage. Server-funded access requires VT+ subscription.
                    <br />
                    <span className="text-muted-foreground/80 text-xs">
                        <strong>VT+ Users:</strong> Server-funded access with rate limits (Flash
                        Lite: 100/day, Flash: 50/day, Pro: 25/day).
                        <br />
                        <strong>Free Users:</strong> Must provide own Gemini API key (BYOK) - no
                        server costs apply.
                        <br />
                        <strong>Budget Policy:</strong> Service may be temporarily unavailable if
                        monthly budget is exceeded.
                        <br />
                        <a
                            href="https://ai.google.dev/gemini-api/docs/models"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                        >
                            View official Gemini model documentation →
                        </a>
                    </span>
                </TypographyMuted>
            </div>

            {/* VT+ Features Usage Chart */}
            <VtPlusUsageChart userId={userId} />

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
                            "flash-lite-2-5": {
                                label: `${MODEL_CONFIG[ModelEnum.GEMINI_2_5_FLASH_LITE].name}`,
                                color: "hsl(var(--chart-1))",
                            },
                            "flash-2-5": {
                                label: `${MODEL_CONFIG[ModelEnum.GEMINI_2_5_FLASH].name}`,
                                color: "hsl(var(--chart-2))",
                            },
                            "pro-2-5": {
                                label: `${MODEL_CONFIG[ModelEnum.GEMINI_2_5_PRO].name}`,
                                color: "hsl(var(--chart-3))",
                            },
                        }}
                        className="min-h-[240px] w-full max-w-full overflow-hidden"
                    >
                        <LineChart
                            data={(() => {
                                const now = new Date();
                                const currentHour = now.getHours();
                                const hourlyData = [];

                                // Get actual daily usage values
                                const flashLiteUsage =
                                    modelStatuses[ModelEnum.GEMINI_2_5_FLASH_LITE]?.dailyUsed || 0;
                                const flashUsage =
                                    modelStatuses[ModelEnum.GEMINI_2_5_FLASH]?.dailyUsed || 0;
                                const proUsage =
                                    modelStatuses[ModelEnum.GEMINI_2_5_PRO]?.dailyUsed || 0;

                                // Generate hourly data points from 00:00 to current hour + 2 offset
                                for (let hour = 0; hour <= Math.min(currentHour + 2, 23); hour++) {
                                    const timeLabel = `${hour.toString().padStart(2, "0")}:00`;

                                    if (hour === 0) {
                                        // Start at 0
                                        hourlyData.push({
                                            time: timeLabel,
                                            "flash-lite-2-5": 0,
                                            "flash-2-5": 0,
                                            "pro-2-5": 0,
                                        });
                                    } else if (hour <= currentHour) {
                                        // Gradually increase to current usage at current hour
                                        const progress = hour / currentHour;
                                        hourlyData.push({
                                            time: timeLabel,
                                            "flash-lite-2-5": Math.round(flashLiteUsage * progress),
                                            "flash-2-5": Math.round(flashUsage * progress),
                                            "pro-2-5": Math.round(proUsage * progress),
                                        });
                                    } else {
                                        // Future hours show current total (flat line)
                                        hourlyData.push({
                                            time: timeLabel,
                                            "flash-lite-2-5": flashLiteUsage,
                                            "flash-2-5": flashUsage,
                                            "pro-2-5": proUsage,
                                        });
                                    }
                                }

                                return hourlyData;
                            })()}
                            margin={{
                                top: 20,
                                right: 10,
                                left: 5,
                                bottom: 5,
                            }}
                            accessibilityLayer
                        >
                            <CartesianGrid
                                vertical={false}
                                stroke="hsl(var(--border))"
                                opacity={0.3}
                            />
                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 10 }}
                                interval="preserveStartEnd"
                                minTickGap={40}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 10 }}
                                allowDecimals={false}
                                width={50}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend
                                content={<ChartLegendContent />}
                                className="flex-wrap justify-center text-xs"
                            />
                            <Line
                                type="monotone"
                                dataKey="flash-lite-2-5"
                                stroke="var(--color-flash-lite-2-5)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                    r: 4,
                                    strokeWidth: 2,
                                    fill: "var(--color-flash-lite-2-5)",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="flash-2-5"
                                stroke="var(--color-flash-2-5)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                    r: 4,
                                    strokeWidth: 2,
                                    fill: "var(--color-flash-2-5)",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="pro-2-5"
                                stroke="var(--color-pro-2-5)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                    r: 4,
                                    strokeWidth: 2,
                                    fill: "var(--color-pro-2-5)",
                                }}
                            />
                        </LineChart>
                    </ChartContainer>

                    {/* Usage Statistics Grid */}
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                        <div className="bg-muted/20 rounded-lg p-4 text-center">
                            <div className="text-foreground text-2xl font-bold">
                                {totalRequestsToday}
                            </div>
                            <div className="text-muted-foreground text-sm">
                                Total Requests Today
                            </div>
                        </div>
                        <div className="bg-muted/20 rounded-lg p-4 text-center">
                            <div className="text-foreground text-2xl font-bold">
                                {Object.values(modelStatuses).reduce(
                                    (sum, status) => sum + status.minuteUsed,
                                    0,
                                )}
                            </div>
                            <div className="text-muted-foreground text-sm">
                                Requests This Minute
                            </div>
                        </div>
                        <div className="bg-muted/20 rounded-lg p-4 text-center">
                            <div className="text-foreground text-2xl font-bold">
                                {
                                    Object.keys(modelStatuses).filter(
                                        (model) => modelStatuses[model]?.dailyUsed > 0,
                                    ).length
                                }
                            </div>
                            <div className="text-muted-foreground text-sm">Active Models</div>
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
                    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* VT+ Subscription */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-chart-1 h-3 w-3 rounded-full" />
                                <div className="text-foreground font-medium">VT+ Subscription</div>
                            </div>
                            <div className="bg-background/50 border-chart-1/20 rounded-lg border p-4">
                                <div className="text-muted-foreground space-y-2 text-sm">
                                    <div className="text-foreground mb-3 font-medium">
                                        Server-funded Access
                                    </div>
                                    <div>
                                        • <strong>Unlimited</strong> Gemini 2.5 Flash Lite access
                                    </div>
                                    <div>• Enhanced limits for all Gemini models</div>
                                    <div>• No API key required for Gemini models</div>
                                    <div>• Immediate access without setup</div>
                                    <div>• Priority support</div>
                                    <div>
                                        • 3 exclusive research features (Deep Research, Pro Search,
                                        AI Memory)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Free Tier */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-chart-2 h-3 w-3 rounded-full" />
                                <div className="text-foreground font-medium">
                                    Free Tier (Registered Users)
                                </div>
                            </div>
                            <div className="bg-background/50 border-chart-2/20 rounded-lg border p-4">
                                <div className="text-muted-foreground space-y-2 text-sm">
                                    <div className="text-foreground mb-3 font-medium">
                                        Limited Server Access + BYOK
                                    </div>
                                    <div>
                                        • Gemini 2.5 Flash Lite:{" "}
                                        <strong>{GEMINI_LIMITS.FLASH_LITE.FREE_DAY}/day</strong>,{" "}
                                        {GEMINI_LIMITS.FLASH_LITE.FREE_MINUTE}/min
                                    </div>
                                    <div>• Must provide own API key for other models</div>
                                    <div>• Unlimited usage with BYOK</div>
                                    <div>• All advanced features included</div>
                                    <div>• Local API key encryption</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rate Limits Breakdown */}
                    <div className="mb-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-chart-3 h-3 w-3 rounded-full" />
                            <div className="text-foreground font-medium">
                                Server-funded Rate Limits
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            <div className="bg-background/50 rounded-lg p-3">
                                <div className="text-foreground mb-2 text-sm font-medium">
                                    Gemini 2.5 Flash Lite
                                </div>
                                <div className="text-muted-foreground space-y-1 text-xs">
                                    <div>
                                        VT+: <span className="font-medium">Unlimited</span>{" "}
                                        <span className="text-muted-foreground/70 text-xs">
                                            (usage tracked)
                                        </span>
                                    </div>
                                    <div>
                                        Free:{" "}
                                        <span className="font-medium">
                                            {GEMINI_LIMITS.FLASH_LITE.FREE_DAY}/day,{" "}
                                            {GEMINI_LIMITS.FLASH_LITE.FREE_MINUTE}/min
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3">
                                <div className="text-foreground mb-2 text-sm font-medium">
                                    Gemini 2.5 Flash
                                </div>
                                <div className="text-muted-foreground space-y-1 text-xs">
                                    <div>
                                        VT+:{" "}
                                        <span className="font-medium">
                                            {GEMINI_LIMITS.FLASH.PLUS_DAY}/day,{" "}
                                            {GEMINI_LIMITS.FLASH.PLUS_MINUTE}/min
                                        </span>
                                    </div>
                                    <div>
                                        Free: <span className="font-medium">BYOK Required</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3">
                                <div className="text-foreground mb-2 text-sm font-medium">
                                    Gemini 2.5 Pro
                                </div>
                                <div className="text-muted-foreground space-y-1 text-xs">
                                    <div>
                                        VT+:{" "}
                                        <span className="font-medium">
                                            {GEMINI_LIMITS.PRO.PLUS_DAY}/day,{" "}
                                            {GEMINI_LIMITS.PRO.PLUS_MINUTE}/min
                                        </span>
                                    </div>
                                    <div>
                                        Free: <span className="font-medium">BYOK Required</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="space-y-3">
                        <div className="bg-muted/20 border-muted rounded-lg border p-4">
                            <div className="flex items-start gap-2">
                                <div className="bg-muted-foreground mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                                <div className="text-sm">
                                    <div className="text-foreground mb-1 font-medium">
                                        VT+ Usage Tracking
                                    </div>
                                    <div className="text-muted-foreground space-y-1">
                                        <div>
                                            • <strong>Flash Lite (2.5 & 2.0):</strong> Unlimited
                                            access with usage tracked for display purposes
                                        </div>
                                        <div>
                                            • <strong>Flash & Pro (2.5 & 2.0):</strong> Count
                                            against both model-specific limits AND Flash Lite quota
                                            (stricter limit applies)
                                        </div>
                                        <div>
                                            • <strong>All models:</strong> Usage is tracked and
                                            displayed in the chart for transparency
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/20 border-muted rounded-lg border p-4">
                            <div className="flex items-start gap-2">
                                <div className="bg-muted-foreground mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                                <div className="text-sm">
                                    <div className="text-foreground mb-1 font-medium">
                                        BYOK (Bring Your Own Key)
                                    </div>
                                    <div className="text-muted-foreground">
                                        Free users can access all Gemini models unlimited by
                                        providing their own Google API key. Keys are encrypted and
                                        stored locally.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/20 border-muted rounded-lg border p-4">
                            <div className="flex items-start gap-2">
                                <div className="bg-muted-foreground mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                                <div className="text-sm">
                                    <div className="text-foreground mb-1 font-medium">
                                        Google's Pricing Reference
                                    </div>
                                    <div className="text-muted-foreground">
                                        Flash Lite: $0.10/1M tokens • Flash: $0.30/1M tokens • Pro:
                                        $1.25/1M tokens (Input pricing)
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
                    {loading ? "Refreshing..." : "Refresh Usage"}
                </Button>
            </div>
        </div>
    );
}

// VT+ Features Usage Chart Component
interface VtPlusUsageChartProps {
    userId?: string;
}

function VtPlusUsageChart({ userId }: VtPlusUsageChartProps) {
    const [vtPlusUsage, setVtPlusUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchVtPlusUsage = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/vtplus/usage");

                if (!response.ok) {
                    if (response.status === 401) {
                        setError("Please sign in to view VT+ usage");
                        return;
                    }
                    throw new Error("Failed to fetch VT+ usage data");
                }

                const data = await response.json();
                setVtPlusUsage(data);
                setError(null);
            } catch {
                setError("Failed to load VT+ usage data");
            } finally {
                setLoading(false);
            }
        };

        fetchVtPlusUsage();
    }, [userId]);

    if (!userId || loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-foreground">VT+ Research Features Usage</CardTitle>
                    <CardDescription>
                        {!userId
                            ? "Sign in to track VT+ feature usage"
                            : "Loading VT+ usage data..."}
                    </CardDescription>
                </CardHeader>
                {loading && (
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                            <div className="bg-muted h-[200px] w-full animate-pulse rounded" />
                        </div>
                    </CardContent>
                )}
            </Card>
        );
    }

    if (error || !vtPlusUsage) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-foreground">VT+ Research Features Usage</CardTitle>
                    <CardDescription>
                        Track your exclusive VT+ research features usage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            {error || "VT+ usage data not available"}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Individual feature data
    const features = [
        {
            name: "Deep Research",
            data: vtPlusUsage.deepResearch || {
                used: 0,
                limit: 0,
                percentage: 0,
                window: QUOTA_WINDOW.DAILY,
            },
            color: "hsl(var(--chart-1))",
            resetPeriod: "Daily Reset",
        },
        {
            name: "Pro Search",
            data: vtPlusUsage.proSearch || {
                used: 0,
                limit: 0,
                percentage: 0,
                window: QUOTA_WINDOW.DAILY,
            },
            color: "hsl(var(--chart-2))",
            resetPeriod: "Daily Reset",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-foreground text-lg font-semibold">
                    VT+ Research Features Usage
                </h3>
                <p className="text-muted-foreground text-sm">
                    Usage tracking for exclusive VT+ research capabilities
                </p>
            </div>

            {/* Individual Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {features.map((feature, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">{feature.name}</CardTitle>
                            <CardDescription>
                                {feature.data.used.toLocaleString()} /{" "}
                                {feature.data.limit.toLocaleString()} requests ·{" "}
                                {feature.resetPeriod}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    used: {
                                        label: "Used",
                                        color: feature.color,
                                    },
                                    quota: {
                                        label: "Quota Limit",
                                        color: "hsl(var(--muted))",
                                    },
                                }}
                                className="min-h-[150px] w-full"
                            >
                                <AreaChart
                                    data={[
                                        {
                                            name: "Used",
                                            used: feature.data.used,
                                            quota: feature.data.limit,
                                        },
                                    ]}
                                    margin={{
                                        top: 20,
                                        right: 10,
                                        left: 10,
                                        bottom: 5,
                                    }}
                                    accessibilityLayer
                                >
                                    <CartesianGrid
                                        vertical={false}
                                        stroke="hsl(var(--border))"
                                        opacity={0.3}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fontSize: 10 }}
                                        hide
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fontSize: 10 }}
                                        allowDecimals={false}
                                        width={60}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        dataKey="quota"
                                        stroke="var(--color-quota)"
                                        fill="var(--color-quota)"
                                        fillOpacity={0.2}
                                        strokeWidth={2}
                                        type="monotone"
                                    />
                                    <Area
                                        dataKey="used"
                                        stroke="var(--color-used)"
                                        fill="var(--color-used)"
                                        fillOpacity={0.6}
                                        strokeWidth={2}
                                        type="monotone"
                                    />
                                </AreaChart>
                            </ChartContainer>

                            {/* Usage Statistics */}
                            <div className="bg-muted/20 mt-4 rounded-lg p-3 text-center">
                                <div className="text-foreground text-xl font-bold">
                                    {feature.data.percentage}%
                                </div>
                                <div className="text-muted-foreground mt-1 text-xs">
                                    Usage Percentage
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

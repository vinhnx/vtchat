'use client';

import { log } from '@repo/shared/lib/logger';
import { QUOTA_WINDOW } from '../src/config/vtPlusLimits';
import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Progress,
} from '@repo/ui';
import { AlertTriangle, CalendarClock, CheckCircle, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VtPlusUsageData {
    deepResearch: {
        used: number;
        limit: number;
        feature: string;
        window: (typeof QUOTA_WINDOW)[keyof typeof QUOTA_WINDOW];
        percentage: number;
        resetAt: string;
    };
    proSearch: {
        used: number;
        limit: number;
        feature: string;
        window: (typeof QUOTA_WINDOW)[keyof typeof QUOTA_WINDOW];
        percentage: number;
        resetAt: string;
    };
    rag: {
        used: number;
        limit: number;
        feature: string;
        window: (typeof QUOTA_WINDOW)[keyof typeof QUOTA_WINDOW];
        percentage: number;
        resetAt: string;
    };
    resetAt: string; // Legacy field for backward compatibility
    currentPeriod: string;
}

interface VtPlusUsageMeterProps {
    userId?: string;
}

export function VtPlusUsageMeter({ userId }: VtPlusUsageMeterProps) {
    const [usage, setUsage] = useState<VtPlusUsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchUsage = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/vtplus/usage');

                if (!response.ok) {
                    if (response.status === 401) {
                        setError('Please sign in to view usage');
                        return;
                    }
                    throw new Error('Failed to fetch usage data');
                }

                const data = await response.json();
                setUsage(data);
                setError(null);
            } catch (err) {
                log.error({ error: err }, 'Failed to fetch VT+ usage');
                setError('Failed to load usage data');
            } finally {
                setLoading(false);
            }
        };

        fetchUsage();
    }, [userId]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-20 bg-muted rounded"></div>
                </div>
                <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-20 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!usage) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-muted-foreground">VT+ usage tracking is not available.</p>
                </CardContent>
            </Card>
        );
    }

    const getResetInfo = (
        resetAt: string,
        window: (typeof QUOTA_WINDOW)[keyof typeof QUOTA_WINDOW]
    ) => {
        const resetDate = new Date(resetAt);
        const now = Date.now();
        const timeUntilReset = resetDate.getTime() - now;

        if (window === QUOTA_WINDOW.DAILY) {
            const hoursUntilReset = Math.ceil(timeUntilReset / (1000 * 60 * 60));
            return {
                text:
                    hoursUntilReset <= 24
                        ? `${hoursUntilReset}h`
                        : `${Math.ceil(hoursUntilReset / 24)}d`,
                full: `Resets ${hoursUntilReset <= 1 ? 'in less than 1 hour' : `in ${hoursUntilReset} hours`} (daily at 00:00 UTC)`,
            };
        } else {
            const daysUntilReset = Math.ceil(timeUntilReset / (1000 * 60 * 60 * 24));
            return {
                text: `${daysUntilReset}d`,
                full: `Resets in ${daysUntilReset} ${daysUntilReset === 1 ? 'day' : 'days'} (${resetDate.toLocaleDateString()})`,
            };
        }
    };

    const getStatusColor = (percentage: number) => {
        if (percentage >= 90) return 'destructive';
        if (percentage >= 75) return 'secondary';
        return 'default';
    };

    const getStatusIcon = (percentage: number) => {
        if (percentage >= 90) return <AlertTriangle className="h-3 w-3" />;
        if (percentage >= 75) return <TrendingUp className="h-3 w-3" />;
        return <CheckCircle className="h-3 w-3" />;
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-medium">VT+ Usage</h3>
                <p className="text-sm text-muted-foreground">
                    Track your VT+ feature usage and quota limits.
                </p>
            </div>

            <div className="grid gap-4">
                {/* Deep Research Usage */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-medium">Deep Research</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                    Daily
                                </Badge>
                            </div>
                            <Badge
                                variant={getStatusColor(usage.deepResearch.percentage)}
                                className="flex items-center gap-1"
                            >
                                {getStatusIcon(usage.deepResearch.percentage)}
                                {usage.deepResearch.percentage}%
                            </Badge>
                        </div>
                        <CardDescription>
                            {usage.deepResearch.used.toLocaleString()} /{' '}
                            {usage.deepResearch.limit.toLocaleString()} requests •{' '}
                            {
                                getResetInfo(usage.deepResearch.resetAt, usage.deepResearch.window)
                                    .text
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={usage.deepResearch.percentage} className="h-2" />
                    </CardContent>
                </Card>

                {/* Pro Search Usage */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-medium">Pro Search</CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                    Daily
                                </Badge>
                            </div>
                            <Badge
                                variant={getStatusColor(usage.proSearch.percentage)}
                                className="flex items-center gap-1"
                            >
                                {getStatusIcon(usage.proSearch.percentage)}
                                {usage.proSearch.percentage}%
                            </Badge>
                        </div>
                        <CardDescription>
                            {usage.proSearch.used.toLocaleString()} /{' '}
                            {usage.proSearch.limit.toLocaleString()} requests •{' '}
                            {getResetInfo(usage.proSearch.resetAt, usage.proSearch.window).text}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={usage.proSearch.percentage} className="h-2" />
                    </CardContent>
                </Card>

                {/* Personal AI Assistant (RAG) Usage */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-medium">
                                    Personal AI Assistant
                                </CardTitle>
                                <Badge variant="outline" className="text-xs">
                                    Monthly
                                </Badge>
                            </div>
                            <Badge
                                variant={getStatusColor(usage.rag.percentage)}
                                className="flex items-center gap-1"
                            >
                                {getStatusIcon(usage.rag.percentage)}
                                {usage.rag.percentage}%
                            </Badge>
                        </div>
                        <CardDescription>
                            {usage.rag.used.toLocaleString()} / {usage.rag.limit.toLocaleString()}{' '}
                            requests • {getResetInfo(usage.rag.resetAt, usage.rag.window).text}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={usage.rag.percentage} className="h-2" />
                    </CardContent>
                </Card>

                {/* Reset Information */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                                <CalendarClock className="h-4 w-4" />
                                <span>Deep Research & Pro Search reset daily at 00:00 UTC</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CalendarClock className="h-4 w-4" />
                                <span>Personal AI Assistant resets monthly on the 1st</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
                <p>• Deep Research & Pro Search have daily quotas (5 & 10 per day)</p>
                <p>• Personal AI Assistant has monthly quotas (2,000 per month)</p>
                <p>• BYOK (Bring Your Own Key) users have unlimited usage</p>
                <p>• Quotas are designed to fit within budget constraints</p>
            </div>
        </div>
    );
}

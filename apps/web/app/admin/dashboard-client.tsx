'use client';

import { SystemMetricsChart } from '@repo/common/components/admin/system-metrics-chart';
import {
    Badge,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    LoadingSpinner,
    TypographyH2,
} from '@repo/ui';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Clock, Shield, TrendingUp } from 'lucide-react';

type AdminStats = {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    bannedUsers: number;
    systemHealth: 'good' | 'warning' | 'critical';
    lastMaintenanceRun: string;
    vtPlusUsers: number;
    conversionRate: string;
    totalFeedback: number;
    totalResources: number;
    providerUsage: Array<{
        provider: string;
        requests: number;
        costUsd: string;
    }>;
};

type WebSearchDebug = {
    status: string;
    timestamp: string;
    service: string;
    webSearchConfig: {
        hasGeminiApiKey: boolean;
        geminiKeyLength: number;
        geminiKeyPrefix: string;
        hasJinaApiKey: boolean;
        jinaKeyLength: number;
        environment: string;
        isProduction: boolean;
        isFlyApp: boolean;
        isVercel: boolean;
    };
    budgetStatus: {
        shouldDisable?: boolean;
        error?: string;
    };
    webSearchTest: {
        taskAvailable: boolean;
        status: string;
        error?: string;
    };
    recommendations: Array<{ type: string; message: string; action: string; }>;
};

type Props = {
    initialStats: AdminStats | null;
    webSearchDebug: WebSearchDebug | null;
};

const getHealthColor = (health: string) => {
    switch (health) {
        case 'good':
            return 'bg-muted text-foreground';
        case 'warning':
            return 'bg-muted text-muted-foreground';
        case 'critical':
            return 'bg-muted text-foreground';
        default:
            return 'bg-muted text-muted-foreground';
    }
};

const getHealthIcon = (health: string) => {
    switch (health) {
        case 'good':
            return CheckCircle;
        case 'warning':
            return AlertTriangle;
        case 'critical':
            return AlertTriangle;
        default:
            return Clock;
    }
};

export function AdminDashboardClient({ initialStats, webSearchDebug }: Props) {
    const stats = initialStats;

    if (!stats) {
        return (
            <div className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className='pb-2'>
                                <LoadingSpinner />
                            </CardHeader>
                            <CardContent>
                                <LoadingSpinner />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className='text-muted-foreground text-sm'>
                    Unable to load admin analytics right now. Please retry or check API
                    availability.
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-8'>
            {/* Overview Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <TypographyH2 className='mb-6'>VT Terminal</TypographyH2>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                    <Card>
                        <CardHeader className='pb-2'>
                            <CardTitle className='text-muted-foreground text-sm font-medium'>
                                Total Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                {stats?.totalUsers.toLocaleString()}
                            </div>
                            <div className='text-muted-foreground flex items-center text-sm'>
                                <TrendingUp className='mr-1 h-4 w-4' />+{stats?.newUsersToday} today
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='pb-2'>
                            <CardTitle className='text-muted-foreground text-sm font-medium'>
                                Active Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                {stats?.activeUsers.toLocaleString()}
                            </div>
                            <div className='text-muted-foreground text-sm'>
                                {stats && Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
                                of total
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='pb-2'>
                            <CardTitle className='text-muted-foreground text-sm font-medium'>
                                System Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='flex items-center space-x-2'>
                                {stats
                                    && (() => {
                                        const HealthIcon = getHealthIcon(stats.systemHealth);
                                        return <HealthIcon className='h-5 w-5 text-green-600' />;
                                    })()}
                                <Badge className={stats ? getHealthColor(stats.systemHealth) : ''}>
                                    {stats?.systemHealth.toUpperCase()}
                                </Badge>
                            </div>
                            <div className='text-muted-foreground mt-1 text-sm'>
                                All systems operational
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='pb-2'>
                            <CardTitle className='text-muted-foreground text-sm font-medium'>
                                VT+ Conversion
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{stats?.vtPlusUsers}</div>
                            <div className='text-muted-foreground text-sm'>
                                {stats?.conversionRate}% conversion rate
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            {/* System Metrics Charts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <TypographyH2 className='mb-6'>System Analytics</TypographyH2>
                <SystemMetricsChart
                    totalUsers={stats?.totalUsers || 0}
                    activeUsers={stats?.activeUsers || 0}
                />
            </motion.div>

            {/* Provider Usage Analytics */}
            {stats?.providerUsage && stats.providerUsage.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center'>
                                <TrendingUp className='mr-2 h-5 w-5' />
                                Provider Usage (Last 30 Days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                {stats.providerUsage.map((provider) => (
                                    <div
                                        key={provider.provider}
                                        className='flex items-center justify-between border-b py-2 last:border-0'
                                    >
                                        <div className='flex items-center space-x-3'>
                                            <div className='bg-muted rounded-lg p-2'>
                                                <Activity className='text-foreground h-4 w-4' />
                                            </div>
                                            <div>
                                                <div className='font-medium capitalize'>
                                                    {provider.provider}
                                                </div>
                                                <div className='text-muted-foreground text-sm'>
                                                    {provider.requests.toLocaleString()} requests
                                                </div>
                                            </div>
                                        </div>
                                        <div className='text-right'>
                                            <div className='font-medium'>${provider.costUsd}</div>
                                            <div className='text-muted-foreground text-sm'>USD</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center'>
                            <Activity className='mr-2 h-5 w-5' />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between border-b py-2'>
                                <div className='flex items-center space-x-3'>
                                    <CheckCircle className='h-4 w-4 text-green-600' />
                                    <span className='text-sm'>Database maintenance completed</span>
                                </div>
                                <span className='text-muted-foreground text-xs'>2 minutes ago</span>
                            </div>
                            <div className='flex items-center justify-between border-b py-2'>
                                <div className='flex items-center space-x-3'>
                                    <Activity className='h-4 w-4 text-blue-600' />
                                    <span className='text-sm'>
                                        New user registered: john@example.com
                                    </span>
                                </div>
                                <span className='text-muted-foreground text-xs'>5 minutes ago</span>
                            </div>
                            <div className='flex items-center justify-between py-2'>
                                <div className='flex items-center space-x-3'>
                                    <Shield className='h-4 w-4 text-yellow-600' />
                                    <span className='text-sm'>
                                        Security scan completed - No issues found
                                    </span>
                                </div>
                                <span className='text-muted-foreground text-xs'>1 hour ago</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Web Search Debug Card */}
            {webSearchDebug && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center'>
                                <Shield className='mr-2 h-5 w-5' />
                                Web Search Debug
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='text-muted-foreground mb-2 text-xs'>
                                {webSearchDebug.timestamp}
                            </div>
                            <div className='mb-2 text-sm font-medium'>
                                Service: {webSearchDebug.service}
                            </div>
                            <div className='mb-2 text-sm'>
                                Gemini API Key: {webSearchDebug.webSearchConfig.hasGeminiApiKey
                                    ? `Set (${webSearchDebug.webSearchConfig.geminiKeyPrefix}...)`
                                    : 'Not set'}
                            </div>
                            <div className='mb-2 text-sm'>
                                Jina API Key:{' '}
                                {webSearchDebug.webSearchConfig.hasJinaApiKey ? 'Set' : 'Not set'}
                            </div>
                            <div className='mb-2 text-sm'>
                                Environment: {webSearchDebug.webSearchConfig.environment}
                            </div>
                            <div className='mb-2 text-sm'>
                                Budget Status: {webSearchDebug.budgetStatus?.shouldDisable
                                    ? 'Gemini Disabled'
                                    : 'OK'}
                            </div>
                            <div className='mb-2 text-sm'>
                                Web Search Task: {webSearchDebug.webSearchTest?.taskAvailable
                                    ? 'Available'
                                    : 'Unavailable'}
                            </div>
                            {webSearchDebug.recommendations.length > 0 && (
                                <div className='mt-2'>
                                    <div className='mb-1 text-sm font-semibold'>
                                        Recommendations:
                                    </div>
                                    <ul className='ml-4 list-disc text-xs'>
                                        {webSearchDebug.recommendations.map((rec) => (
                                            <li
                                                key={rec.message + rec.action}
                                                className={rec.type === 'critical'
                                                    ? 'text-red-600'
                                                    : rec.type === 'warning'
                                                    ? 'text-yellow-600'
                                                    : 'text-muted-foreground'}
                                            >
                                                {rec.message}{' '}
                                                <span className='font-normal'>({rec.action})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}

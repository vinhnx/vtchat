'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@repo/ui';
import { BarChart3, TrendingUp, PieChart as PieIcon, Calendar } from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';

interface UserChartsProps {
    users: any[];
    stats: any;
    planDistribution: Array<{ plan: string; count: number }>;
    registrationTrend: Array<{ date: string; count: number }>;
}

const chartConfig = {
    active: {
        label: 'Active Users',
        color: 'hsl(var(--chart-1))',
    },
    banned: {
        label: 'Banned Users',
        color: 'hsl(var(--chart-2))',
    },
    verified: {
        label: 'Verified Users',
        color: 'hsl(var(--chart-3))',
    },
    unverified: {
        label: 'Unverified Users',
        color: 'hsl(var(--chart-4))',
    },
    vtBase: {
        label: 'VT Base',
        color: 'hsl(var(--chart-1))',
    },
    vtPlus: {
        label: 'VT Plus',
        color: 'hsl(var(--chart-2))',
    },
    registrations: {
        label: 'New Registrations',
        color: 'hsl(var(--chart-3))',
    },
} satisfies ChartConfig;

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
];

export function UserCharts({ users, stats, planDistribution, registrationTrend }: UserChartsProps) {
    // Process user status data
    const activeUsers = users.filter((u) => !u.banned).length;
    const bannedUsers = users.filter((u) => u.banned).length;
    const verifiedUsers = users.filter((u) => u.emailVerified).length;
    const unverifiedUsers = users.filter((u) => !u.emailVerified).length;

    const statusData = [
        { name: 'Active', value: activeUsers, fill: COLORS[0] },
        { name: 'Banned', value: bannedUsers, fill: COLORS[1] },
    ];

    const verificationData = [
        { name: 'Verified', value: verifiedUsers, fill: COLORS[2] },
        { name: 'Unverified', value: unverifiedUsers, fill: COLORS[3] },
    ];

    // Process plan distribution data
    const planData = planDistribution.map((item, index) => ({
        plan: item.plan === 'vt_plus' ? 'VT Plus' : 'VT Base',
        count: item.count,
        fill: COLORS[index % COLORS.length],
    }));

    // Process registration trend data (format dates for display)
    const trendData = registrationTrend.map((item) => ({
        date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        }),
        count: item.count,
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Status Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <PieIcon className="h-5 w-5 mr-2" />
                        User Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Email Verification Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <PieIcon className="h-5 w-5 mr-2" />
                        Email Verification
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <PieChart>
                            <Pie
                                data={verificationData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {verificationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Subscription Plan Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Plan Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <BarChart data={planData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="plan"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis />
                            <Bar dataKey="count" radius={4}>
                                {planData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Registration Trend (Last 30 Days) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Registration Trend
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                            (Last 30 days)
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <AreaChart data={trendData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="hsl(var(--chart-3))"
                                fill="hsl(var(--chart-3))"
                                fillOpacity={0.3}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}

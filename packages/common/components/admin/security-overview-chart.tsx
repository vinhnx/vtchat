"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@repo/ui";
import { Activity, AlertTriangle, Shield, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface SecurityMetrics {
    totalBannedUsers: number;
    activeBans: number;
    recentBans: number;
    totalSessions: number;
    activeSessions: number;
    impersonatedSessions: number;
    suspiciousSessions: number;
    unverifiedEmails: number;
    protectedUsers: number;
}

interface SecurityOverviewChartProps {
    securityMetrics: SecurityMetrics;
}

const chartConfig = {
    banned: {
        label: "Banned Users",
        color: "#BF4545",
    },
    suspicious: {
        label: "Suspicious Activity",
        color: "#D99A4E",
    },
    sessions: {
        label: "Active Sessions",
        color: "#D9487D",
    },
    protected: {
        label: "Protected Users",
        color: "#BFB38F",
    },
    safe: {
        label: "Safe",
        color: "#262626",
    },
} satisfies ChartConfig;

const COLORS = [
    "#BF4545", // Red for threats
    "#D99A4E", // Orange for warnings
    "#D9487D", // Pink for normal
    "#BFB38F", // Beige for protected
];

export function SecurityOverviewChart({ securityMetrics }: SecurityOverviewChartProps) {
    // Security threat levels over time (mock data)
    const threatTimelineData = [
        { date: "7d ago", threats: 2, warnings: 5, normal: 95 },
        { date: "6d ago", threats: 1, warnings: 3, normal: 97 },
        { date: "5d ago", threats: 3, warnings: 7, normal: 92 },
        { date: "4d ago", threats: 1, warnings: 4, normal: 96 },
        { date: "3d ago", threats: 2, warnings: 6, normal: 94 },
        { date: "2d ago", threats: 0, warnings: 3, normal: 98 },
        { date: "1d ago", threats: 1, warnings: 2, normal: 97 },
        {
            date: "Today",
            threats: securityMetrics.recentBans,
            warnings: securityMetrics.suspiciousSessions,
            normal: 95,
        },
    ];

    // Current security status breakdown
    const securityStatusData = [
        {
            name: "Banned Users",
            value: securityMetrics.totalBannedUsers,
            color: COLORS[0],
        },
        {
            name: "Suspicious Sessions",
            value: securityMetrics.suspiciousSessions,
            color: COLORS[1],
        },
        {
            name: "Unverified Emails",
            value: securityMetrics.unverifiedEmails,
            color: COLORS[2],
        },
        {
            name: "Protected Users",
            value: securityMetrics.protectedUsers,
            color: COLORS[3],
        },
    ];

    // Session security breakdown
    const sessionSecurityData = [
        {
            category: "Active Sessions",
            count: securityMetrics.activeSessions,
            percentage: (
                (securityMetrics.activeSessions / securityMetrics.totalSessions) *
                100
            ).toFixed(1),
        },
        {
            category: "Impersonated",
            count: securityMetrics.impersonatedSessions,
            percentage: (
                (securityMetrics.impersonatedSessions / securityMetrics.totalSessions) *
                100
            ).toFixed(1),
        },
        {
            category: "Suspicious",
            count: securityMetrics.suspiciousSessions,
            percentage: (
                (securityMetrics.suspiciousSessions / securityMetrics.totalSessions) *
                100
            ).toFixed(1),
        },
    ];

    // Security metrics bar chart data
    const securityMetricsData = [
        { metric: "Total Bans", value: securityMetrics.totalBannedUsers },
        { metric: "Active Bans", value: securityMetrics.activeBans },
        { metric: "Recent Bans", value: securityMetrics.recentBans },
        { metric: "Suspicious", value: securityMetrics.suspiciousSessions },
        { metric: "Unverified", value: securityMetrics.unverifiedEmails },
    ];

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Security Threats Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        Security Threats (7 Days)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <LineChart data={threatTimelineData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                width={40}
                            />
                            <Line
                                type="monotone"
                                dataKey="threats"
                                stroke="#BF4545"
                                strokeWidth={2}
                                name="Threats"
                                dot={{ fill: "#BF4545", strokeWidth: 2, r: 3 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="warnings"
                                stroke="#D99A4E"
                                strokeWidth={2}
                                name="Warnings"
                                dot={{ fill: "#D99A4E", strokeWidth: 2, r: 3 }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Security Metrics Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Shield className="mr-2 h-5 w-5" />
                        Security Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <BarChart data={securityMetricsData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="metric"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                width={40}
                            />
                            <Bar dataKey="value" fill="#D9487D" radius={[4, 4, 0, 0]} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Session Security Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Activity className="mr-2 h-5 w-5" />
                        Session Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sessionSecurityData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.category}</span>
                            <div className="flex items-center space-x-2">
                                <div className="bg-muted h-2 w-24 rounded-full">
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${item.percentage}%`,
                                            backgroundColor:
                                                index === 0
                                                    ? "#D9487D"
                                                    : index === 1
                                                      ? "#D99A4E"
                                                      : "#BF4545",
                                        }}
                                    />
                                </div>
                                <span className="text-muted-foreground w-12 text-right text-sm">
                                    {item.count}
                                </span>
                                <span className="text-muted-foreground w-10 text-right text-xs">
                                    {item.percentage}%
                                </span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Security Status Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Security Status Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {securityStatusData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold">{item.value}</span>
                        </div>
                    ))}
                    <div className="border-t pt-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Total Security Events</span>
                            <span className="font-bold">
                                {securityStatusData.reduce((sum, item) => sum + item.value, 0)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

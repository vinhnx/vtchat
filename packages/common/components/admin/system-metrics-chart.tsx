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
import { Activity, Database, TrendingUp, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

interface SystemMetricsProps {
    totalUsers: number;
    activeUsers: number;
}

const chartConfig = {
    performance: {
        label: "Performance Score",
        color: "#D9487D",
    },
    memory: {
        label: "Memory Usage",
        color: "#262626",
    },
    cpu: {
        label: "CPU Usage",
        color: "#BFB38F",
    },
    users: {
        label: "Active Users",
        color: "#D99A4E",
    },
} satisfies ChartConfig;

export function SystemMetricsChart({ totalUsers, activeUsers }: SystemMetricsProps) {
    // Mock real-time system data (in real app, this would come from monitoring APIs)
    const performanceData = [
        { time: "00:00", performance: 95, memory: 45, cpu: 32 },
        { time: "04:00", performance: 92, memory: 52, cpu: 28 },
        { time: "08:00", performance: 89, memory: 68, cpu: 45 },
        { time: "12:00", performance: 94, memory: 58, cpu: 38 },
        { time: "16:00", performance: 96, memory: 62, cpu: 42 },
        { time: "20:00", performance: 93, memory: 55, cpu: 35 },
    ];

    const userActivityData = [
        { hour: "0", users: Math.floor(activeUsers * 0.1) },
        { hour: "4", users: Math.floor(activeUsers * 0.05) },
        { hour: "8", users: Math.floor(activeUsers * 0.3) },
        { hour: "12", users: Math.floor(activeUsers * 0.8) },
        { hour: "16", users: Math.floor(activeUsers * 0.9) },
        { hour: "20", users: Math.floor(activeUsers * 0.6) },
    ];

    const systemHealthData = [
        { metric: "Database", value: 98, status: "Healthy", color: "#D9487D" },
        { metric: "API", value: 96, status: "Healthy", color: "#D99A4E" },
        { metric: "Memory", value: 78, status: "Good", color: "#BFB38F" },
        { metric: "Storage", value: 65, status: "Good", color: "#BF4545" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        System Performance (24h)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <LineChart data={performanceData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="performance"
                                stroke="#D9487D"
                                strokeWidth={2}
                                dot={{ fill: "#D9487D", strokeWidth: 2, r: 4 }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* User Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        User Activity Today
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <AreaChart data={userActivityData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="hour"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => `${value}:00`}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#D99A4E"
                                fill="#D99A4E"
                                fillOpacity={0.3}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Resource Usage */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Database className="h-5 w-5 mr-2" />
                        Resource Usage
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <LineChart data={performanceData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="memory"
                                stroke="#262626"
                                strokeWidth={2}
                                name="Memory %"
                            />
                            <Line
                                type="monotone"
                                dataKey="cpu"
                                stroke="#BFB38F"
                                strokeWidth={2}
                                name="CPU %"
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* System Health Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2" />
                        System Health
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {systemHealthData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.metric}</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-24 bg-muted rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${item.value}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                                <span className="text-sm text-muted-foreground">{item.value}%</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

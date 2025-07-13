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
import { Clock, Database, HardDrive, Zap } from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
} from "recharts";

const chartConfig = {
    queries: {
        label: "Queries/sec",
        color: "#D9487D",
    },
    connections: {
        label: "Active Connections",
        color: "#262626",
    },
    size: {
        label: "Database Size",
        color: "#BFB38F",
    },
    performance: {
        label: "Performance",
        color: "#D99A4E",
    },
} satisfies ChartConfig;

export function DatabaseMetricsChart() {
    // Mock database metrics (in real app, these would come from database monitoring)
    const queryPerformanceData = [
        { time: "00:00", queries: 45, connections: 12 },
        { time: "04:00", queries: 23, connections: 8 },
        { time: "08:00", queries: 89, connections: 25 },
        { time: "12:00", queries: 156, connections: 42 },
        { time: "16:00", queries: 134, connections: 38 },
        { time: "20:00", queries: 98, connections: 28 },
    ];

    const storageData = [
        { name: "Users Data", value: 45, fill: "#D9487D" },
        { name: "Chat History", value: 30, fill: "#262626" },
        { name: "Files", value: 15, fill: "#BFB38F" },
        { name: "System", value: 10, fill: "#D99A4E" },
    ];

    const slowQueriesData = [
        { query: "User Search", avgTime: 1200, count: 45 },
        { query: "Chat Fetch", avgTime: 800, count: 123 },
        { query: "File Upload", avgTime: 2100, count: 23 },
        { query: "Analytics", avgTime: 3400, count: 12 },
    ];

    const maintenanceData = [
        { task: "Vacuum", status: "Completed", lastRun: "2 hours ago" },
        { task: "Reindex", status: "Completed", lastRun: "1 day ago" },
        { task: "Backup", status: "Running", lastRun: "30 min ago" },
        { task: "Analytics", status: "Scheduled", lastRun: "6 hours ago" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2" />
                        Database Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <LineChart data={queryPerformanceData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="queries"
                                stroke="#D9487D"
                                strokeWidth={2}
                                name="Queries/sec"
                            />
                            <Line
                                type="monotone"
                                dataKey="connections"
                                stroke="#262626"
                                strokeWidth={2}
                                name="Connections"
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Storage Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <HardDrive className="h-5 w-5 mr-2" />
                        Storage Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <PieChart>
                            <Pie
                                data={storageData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                            >
                                {storageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Slow Queries */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Slow Queries Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <BarChart data={slowQueriesData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="query"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.substring(0, 8)}
                            />
                            <Bar dataKey="avgTime" fill="#BFB38F" radius={4} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Maintenance Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Database className="h-5 w-5 mr-2" />
                        Maintenance Tasks
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {maintenanceData.map((task, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-medium">{task.task}</span>
                                <p className="text-xs text-muted-foreground">{task.lastRun}</p>
                            </div>
                            <div
                                className={`px-2 py-1 rounded-full text-xs ${
                                    task.status === "Completed"
                                        ? "bg-muted text-foreground"
                                        : task.status === "Running"
                                          ? "bg-muted text-muted-foreground"
                                          : "bg-muted text-muted-foreground"
                                }`}
                            >
                                {task.status}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

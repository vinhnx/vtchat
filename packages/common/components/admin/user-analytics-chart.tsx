"use client";

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
} from "@repo/ui";
import { Shield, UserCheck, Users } from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
} from "recharts";

interface UserAnalyticsProps {
    users: any[];
    totalUsers: number;
}

const chartConfig = {
    active: {
        label: "Active Users",
        color: "#D9487D",
    },
    banned: {
        label: "Banned Users",
        color: "#BF4545",
    },
    admin: {
        label: "Admin Users",
        color: "#262626",
    },
    user: {
        label: "Regular Users",
        color: "#BFB38F",
    },
} satisfies ChartConfig;

export function UserAnalyticsChart({ users, totalUsers }: UserAnalyticsProps) {
    // Process user data for charts
    const activeUsers = users.filter((u) => !u.banned).length;
    const bannedUsers = users.filter((u) => u.banned).length;
    const adminUsers = users.filter((u) => u.role === "admin").length;
    const regularUsers = users.filter((u) => u.role === "user").length;

    // Status chart data
    const statusData = [
        { name: "Active", value: activeUsers, fill: "#D9487D" },
        { name: "Banned", value: bannedUsers, fill: "#BF4545" },
    ];

    // Role distribution data
    const roleData = [
        { role: "Admin", count: adminUsers, fill: "#262626" },
        { role: "User", count: regularUsers, fill: "#BFB38F" },
    ];

    // Monthly registration trend (mock data - in real app this would come from actual dates)
    const monthlyData = [
        { month: "Jan", users: Math.floor(totalUsers * 0.1) },
        { month: "Feb", users: Math.floor(totalUsers * 0.15) },
        { month: "Mar", users: Math.floor(totalUsers * 0.12) },
        { month: "Apr", users: Math.floor(totalUsers * 0.18) },
        { month: "May", users: Math.floor(totalUsers * 0.2) },
        { month: "Jun", users: Math.floor(totalUsers * 0.25) },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Status Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        User Status Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Role Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <BarChart data={roleData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="role"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <Bar dataKey="count" fill="#262626" radius={4} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Monthly User Growth */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <UserCheck className="h-5 w-5 mr-2" />
                        Monthly User Registration Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <AreaChart data={monthlyData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#D9487D"
                                fill="#D9487D"
                                fillOpacity={0.2}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}

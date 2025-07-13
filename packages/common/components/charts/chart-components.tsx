"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@repo/ui";
import { BarChart3, TrendingUp } from "lucide-react";
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
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    XAxis,
    YAxis,
} from "recharts";

// Type definitions for chart data
export type ChartComponentData = {
    type: "barChart" | "lineChart" | "areaChart" | "pieChart" | "radarChart";
    title: string;
    data: any[];
    // Area chart specific properties
    xAxisLabel?: string;
    yAxisLabel?: string;
    series1Name?: string;
    series2Name?: string;
    series3Name?: string;
    dataKey1?: string;
    dataKey2?: string;
    dataKey3?: string;
    stacked?: boolean;
    [key: string]: any;
};

// Color scheme for charts
const CHART_COLORS = {
    primary: "hsl(var(--chart-1))",
    secondary: "hsl(var(--chart-2))",
    tertiary: "hsl(var(--chart-3))",
    quaternary: "hsl(var(--chart-4))",
    quinary: "hsl(var(--chart-5))",
};

// Bar Chart Component
const InteractiveBarChart = ({ title, data, xAxisLabel, yAxisLabel, color }: any) => {
    const chartConfig = {
        value: {
            label: yAxisLabel || "Value",
            color: CHART_COLORS.primary,
        },
    } satisfies ChartConfig;

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-8 py-6 sm:py-8">
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        {title}
                    </CardTitle>
                    <CardDescription>
                        {xAxisLabel && yAxisLabel
                            ? `${xAxisLabel} vs ${yAxisLabel}`
                            : "Data visualization"}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-8 py-8">
                <ChartContainer className="aspect-auto h-[250px] w-full" config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            axisLine={false}
                            dataKey="name"
                            minTickGap={32}
                            tickLine={false}
                            tickMargin={8}
                        />
                        <YAxis axisLine={false} tickLine={false} tickMargin={8} />
                        <ChartTooltip
                            content={<ChartTooltipContent className="w-[150px]" nameKey="value" />}
                        />
                        <Bar
                            className="transition-opacity hover:opacity-80"
                            dataKey="value"
                            fill="var(--color-value)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

// Line Chart Component
const InteractiveLineChart = ({
    title,
    data,
    xAxisLabel,
    yAxisLabel,
    series1Name,
    series2Name,
    series3Name,
}: any) => {
    const chartConfig = {
        series1: {
            label: series1Name || "Series 1",
            color: CHART_COLORS.primary,
        },
        ...(series2Name && {
            series2: {
                label: series2Name,
                color: CHART_COLORS.secondary,
            },
        }),
        ...(series3Name && {
            series3: {
                label: series3Name,
                color: CHART_COLORS.tertiary,
            },
        }),
    } satisfies ChartConfig;

    return (
        <Card className="w-full">
            <CardHeader className="px-8 py-6">
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {title}
                </CardTitle>
                <CardDescription>
                    {xAxisLabel && yAxisLabel
                        ? `${xAxisLabel} vs ${yAxisLabel}`
                        : "Trending data over time"}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-8 py-8">
                <ChartContainer className="h-[300px] w-full" config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis axisLine={false} dataKey="name" tickLine={false} tickMargin={8} />
                        <YAxis axisLine={false} tickLine={false} tickMargin={8} />
                        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line
                            activeDot={{
                                r: 6,
                                strokeWidth: 0,
                            }}
                            className="drop-shadow-sm"
                            dataKey="series1"
                            dot={{
                                fill: "var(--color-series1)",
                                strokeWidth: 2,
                                r: 4,
                            }}
                            stroke="var(--color-series1)"
                            strokeWidth={2}
                            type="monotone"
                        />
                        {series2Name && (
                            <Line
                                activeDot={{
                                    r: 6,
                                    strokeWidth: 0,
                                }}
                                className="drop-shadow-sm"
                                dataKey="series2"
                                dot={{
                                    fill: "var(--color-series2)",
                                    strokeWidth: 2,
                                    r: 4,
                                }}
                                stroke="var(--color-series2)"
                                strokeWidth={2}
                                type="monotone"
                            />
                        )}
                        {series3Name && (
                            <Line
                                activeDot={{
                                    r: 6,
                                    strokeWidth: 0,
                                }}
                                className="drop-shadow-sm"
                                dataKey="series3"
                                dot={{
                                    fill: "var(--color-series3)",
                                    strokeWidth: 2,
                                    r: 4,
                                }}
                                stroke="var(--color-series3)"
                                strokeWidth={2}
                                type="monotone"
                            />
                        )}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

// Area Chart Component
const InteractiveAreaChart = ({
    title,
    data,
    xAxisLabel,
    yAxisLabel,
    series1Name,
    series2Name,
    series3Name,
    stacked,
    dataKey1,
    dataKey2,
    dataKey3,
}: any) => {
    const chartConfig = {
        [dataKey1 || "uv"]: {
            label: series1Name || "Series 1",
            color: CHART_COLORS.primary,
        },
        ...(series2Name && {
            [dataKey2 || "pv"]: {
                label: series2Name,
                color: CHART_COLORS.secondary,
            },
        }),
        ...(series3Name && {
            [dataKey3 || "amt"]: {
                label: series3Name,
                color: CHART_COLORS.tertiary,
            },
        }),
    } satisfies ChartConfig;

    return (
        <Card className="w-full">
            <CardHeader className="px-8 py-6">
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {xAxisLabel && yAxisLabel
                        ? `${xAxisLabel} vs ${yAxisLabel}`
                        : "Area visualization"}
                    {stacked && " (Stacked)"}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-8 py-8">
                <div style={{ width: "100%", height: 300 }}>
                    <ChartContainer className="h-full w-full" config={chartConfig}>
                        <AreaChart
                            accessibilityLayer
                            data={data}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tickMargin={8}
                            />
                            <YAxis axisLine={false} tickLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            {(series2Name || series3Name) && (
                                <ChartLegend content={<ChartLegendContent />} />
                            )}
                            <Area
                                type="monotone"
                                dataKey={dataKey1 || "uv"}
                                stroke="var(--color-uv)"
                                fill="var(--color-uv)"
                                fillOpacity={0.6}
                                strokeWidth={2}
                                stackId={stacked ? "stack" : undefined}
                                className="drop-shadow-sm"
                            />
                            {series2Name && (
                                <Area
                                    type="monotone"
                                    dataKey={dataKey2 || "pv"}
                                    stroke="var(--color-pv)"
                                    fill="var(--color-pv)"
                                    fillOpacity={0.6}
                                    strokeWidth={2}
                                    stackId={stacked ? "stack" : undefined}
                                    className="drop-shadow-sm"
                                />
                            )}
                            {series3Name && (
                                <Area
                                    type="monotone"
                                    dataKey={dataKey3 || "amt"}
                                    stroke="var(--color-amt)"
                                    fill="var(--color-amt)"
                                    fillOpacity={0.6}
                                    strokeWidth={2}
                                    stackId={stacked ? "stack" : undefined}
                                    className="drop-shadow-sm"
                                />
                            )}
                        </AreaChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
};

// Pie Chart Component
const InteractivePieChart = ({ title, data, showLabels, showLegend }: any) => {
    const chartConfig = data.reduce((config: any, item: any, index: number) => {
        const colorKeys = Object.keys(CHART_COLORS);
        const colorKey = colorKeys[index % colorKeys.length];
        config[item.name.toLowerCase().replace(/\s+/g, "")] = {
            label: item.name,
            color: CHART_COLORS[colorKey as keyof typeof CHART_COLORS],
        };
        return config;
    }, {}) satisfies ChartConfig;

    const total = data.reduce((acc: number, item: any) => acc + item.value, 0);

    return (
        <Card className="w-full">
            <CardHeader className="items-center px-8 py-6">
                <CardTitle>{title}</CardTitle>
                <CardDescription>Distribution across {data.length} categories</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 px-8 py-8">
                <ChartContainer
                    className="mx-auto aspect-square max-h-[300px]"
                    config={chartConfig}
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                        <Pie
                            className="focus:outline-none"
                            data={data}
                            dataKey="value"
                            innerRadius={60}
                            nameKey="name"
                            strokeWidth={2}
                        >
                            {data.map((_entry: any, index: number) => {
                                const colorKeys = Object.keys(CHART_COLORS);
                                const colorKey = colorKeys[index % colorKeys.length];
                                return (
                                    <Cell
                                        className="cursor-pointer transition-opacity hover:opacity-80"
                                        fill={CHART_COLORS[colorKey as keyof typeof CHART_COLORS]}
                                        key={`cell-${index}`}
                                    />
                                );
                            })}
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 font-medium leading-none">
                        Total: {total.toLocaleString()} items
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 leading-none">
                        Showing distribution of {data.length} categories
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Radar Chart Component
const InteractiveRadarChart = ({ title, data, maxValue }: any) => {
    const chartConfig = {
        value: {
            label: "Value",
            color: CHART_COLORS.primary,
        },
    } satisfies ChartConfig;

    return (
        <Card className="w-full">
            <CardHeader className="items-center px-8 py-6">
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    Multi-dimensional analysis across {data.length} metrics
                </CardDescription>
            </CardHeader>
            <CardContent className="px-8 py-8">
                <ChartContainer
                    className="mx-auto aspect-square max-h-[300px]"
                    config={chartConfig}
                >
                    <RadarChart data={data}>
                        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                        <PolarAngleAxis dataKey="category" />
                        <PolarGrid gridType="polygon" />
                        <Radar
                            className="drop-shadow-sm"
                            dataKey="value"
                            fill="var(--color-value)"
                            fillOpacity={0.4}
                            stroke="var(--color-value)"
                            strokeWidth={2}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

// Main Chart Component with improved interactivity
export const ChartComponent = ({ chartData }: { chartData: ChartComponentData }) => {
    switch (chartData.type) {
        case "barChart":
            return <InteractiveBarChart {...chartData} />;
        case "lineChart":
            return <InteractiveLineChart {...chartData} />;
        case "areaChart":
            return <InteractiveAreaChart {...chartData} />;
        case "pieChart":
            return <InteractivePieChart {...chartData} />;
        case "radarChart":
            return <InteractiveRadarChart {...chartData} />;
        default:
            return (
                <Card className="w-full">
                    <CardContent className="flex h-[200px] items-center justify-center px-8 py-8">
                        <p className="text-muted-foreground">
                            Unsupported chart type: {chartData.type}
                        </p>
                    </CardContent>
                </Card>
            );
    }
};

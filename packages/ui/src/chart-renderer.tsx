"use client";

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
    PolarRadiusAxis,
    Radar,
    RadarChart,
    XAxis,
    YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/card";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "./components/chart";

interface BaseChartData {
    name: string;
    value: number;
}

interface MultiSeriesData {
    name: string;
    series1: number;
    series2?: number;
    series3?: number;
}

interface RadarData {
    category: string;
    value: number;
    fullMark?: number;
}

interface BarChartProps {
    type: "barChart";
    title: string;
    data: BaseChartData[];
    xAxisLabel?: string;
    yAxisLabel?: string;
    color?: string;
}

interface LineChartProps {
    type: "lineChart";
    title: string;
    data: MultiSeriesData[];
    xAxisLabel?: string;
    yAxisLabel?: string;
    series1Name?: string;
    series2Name?: string;
    series3Name?: string;
}

interface AreaChartProps {
    type: "areaChart";
    title: string;
    data: MultiSeriesData[];
    xAxisLabel?: string;
    yAxisLabel?: string;
    series1Name?: string;
    series2Name?: string;
    stacked?: boolean;
}

interface PieChartProps {
    type: "pieChart";
    title: string;
    data: BaseChartData[];
    showLabels?: boolean;
    showLegend?: boolean;
}

interface RadarChartProps {
    type: "radarChart";
    title: string;
    data: RadarData[];
    maxValue?: number;
}

export type ChartProps =
    | BarChartProps
    | LineChartProps
    | AreaChartProps
    | PieChartProps
    | RadarChartProps;

// Custom color palette
const CHART_COLORS = [
    "#D9487D", // Pink/Magenta
    "#383B73", // Dark Blue
    "#171C26", // Dark Navy
    "#BFB38F", // Beige/Tan
    "#A63333", // Dark Red
];

// Chart configurations with custom color palette
const getChartConfig = (data: any[], type: string): ChartConfig => {
    const config: ChartConfig = {};

    if (type === "pie") {
        data.forEach((item, index) => {
            config[item.name] = {
                label: item.name,
                color: CHART_COLORS[index % CHART_COLORS.length],
            };
        });
    } else if (type === "bar") {
        config.value = {
            label: "Value",
            color: CHART_COLORS[0],
        };
    } else if (type === "line" || type === "area") {
        config.series1 = {
            label: "Series 1",
            color: CHART_COLORS[0],
        };
        config.series2 = {
            label: "Series 2",
            color: CHART_COLORS[1],
        };
        config.series3 = {
            label: "Series 3",
            color: CHART_COLORS[2],
        };
    } else if (type === "radar") {
        config.value = {
            label: "Value",
            color: CHART_COLORS[0],
        };
    }

    return config;
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            dominantBaseline="central"
            fill="white"
            fontSize={12}
            fontWeight="500"
            textAnchor={x > cx ? "start" : "end"}
            x={x}
            y={y}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function ChartRenderer(props: ChartProps) {
    const { type, title } = props;

    const renderChart = () => {
        switch (type) {
            case "barChart": {
                const chartConfig = getChartConfig(props.data, "bar");
                return (
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart
                            data={props.data}
                            accessibilityLayer
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey="value"
                                fill="var(--color-value)"
                                radius={[4, 4, 0, 0]}
                                className="transition-opacity hover:opacity-80"
                            />
                        </BarChart>
                    </ChartContainer>
                );
            }

            case "lineChart": {
                const chartConfig = getChartConfig(props.data, "line");
                return (
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <LineChart
                            data={props.data}
                            accessibilityLayer
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                type="monotone"
                                dataKey="series1"
                                stroke="var(--color-series1)"
                                strokeWidth={2}
                                dot={{ fill: "var(--color-series1)", strokeWidth: 2, r: 4 }}
                                activeDot={{
                                    r: 6,
                                    strokeWidth: 2,
                                    stroke: "var(--color-series1)",
                                }}
                                className="drop-shadow-sm"
                            />
                            {props.data.some((d) => d.series2 !== undefined) && (
                                <Line
                                    type="monotone"
                                    dataKey="series2"
                                    stroke="var(--color-series2)"
                                    strokeWidth={2}
                                    dot={{ fill: "var(--color-series2)", strokeWidth: 2, r: 4 }}
                                    activeDot={{
                                        r: 6,
                                        strokeWidth: 2,
                                        stroke: "var(--color-series2)",
                                    }}
                                    className="drop-shadow-sm"
                                />
                            )}
                        </LineChart>
                    </ChartContainer>
                );
            }

            case "areaChart": {
                const chartConfig = getChartConfig(props.data, "area");
                return (
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <AreaChart
                            data={props.data}
                            accessibilityLayer
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                                type="monotone"
                                dataKey="series1"
                                stroke="var(--color-series1)"
                                fill="var(--color-series1)"
                                fillOpacity={0.6}
                                strokeWidth={2}
                                stackId={props.stacked ? "1" : undefined}
                                className="drop-shadow-sm"
                                activeDot={{
                                    r: 6,
                                    strokeWidth: 2,
                                    stroke: "var(--color-series1)",
                                }}
                            />
                            {props.data.some((d) => d.series2 !== undefined) && (
                                <Area
                                    type="monotone"
                                    dataKey="series2"
                                    stroke="var(--color-series2)"
                                    fill="var(--color-series2)"
                                    fillOpacity={0.6}
                                    strokeWidth={2}
                                    stackId={props.stacked ? "1" : undefined}
                                    className="drop-shadow-sm"
                                    activeDot={{
                                        r: 6,
                                        strokeWidth: 2,
                                        stroke: "var(--color-series2)",
                                    }}
                                />
                            )}
                        </AreaChart>
                    </ChartContainer>
                );
            }

            case "pieChart": {
                const chartConfig = getChartConfig(props.data, "pie");
                return (
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <PieChart>
                            <ChartTooltip
                                content={<ChartTooltipContent nameKey="name" />}
                                cursor={false}
                            />
                            <Pie
                                cx="50%"
                                cy="50%"
                                data={props.data}
                                dataKey="value"
                                nameKey="name"
                                label={props.showLabels ? renderCustomizedLabel : false}
                                labelLine={false}
                                outerRadius={80}
                            >
                                {props.data.map((_entry, index) => (
                                    <Cell
                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                        key={`cell-${index}`}
                                    />
                                ))}
                            </Pie>
                            {props.showLegend && (
                                <ChartLegend
                                    content={<ChartLegendContent />}
                                    verticalAlign="bottom"
                                />
                            )}
                        </PieChart>
                    </ChartContainer>
                );
            }

            case "radarChart": {
                const chartConfig = getChartConfig(props.data, "radar");
                return (
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <RadarChart data={props.data}>
                            <ChartTooltip content={<ChartTooltipContent nameKey="category" />} />
                            <PolarGrid />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis angle={90} domain={[0, props.maxValue || 100]} />
                            <Radar
                                dataKey="value"
                                fill="var(--color-value)"
                                fillOpacity={0.3}
                                name="Value"
                                stroke="var(--color-value)"
                            />
                        </RadarChart>
                    </ChartContainer>
                );
            }

            default:
                return <div>Unsupported chart type</div>;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {(props as any).xAxisLabel && (
                    <CardDescription>
                        {(props as any).xAxisLabel} vs {(props as any).yAxisLabel}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent>{renderChart()}</CardContent>
        </Card>
    );
}
